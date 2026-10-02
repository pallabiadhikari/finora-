// Finora — backend server
// Handles: MongoDB connection, auth (register/login/me),
// password reset via Resend, admin routes, and data routes.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';
import dns from 'node:dns';

// Fix for Windows Node.js SRV resolution bug
dns.setServers(['1.1.1.1', '8.8.8.8']);

dotenv.config();

/* ---------- Config ---------- */

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'finora_dev_secret_change_me';

// Super-admin email — only this account can promote/demote admins.
// TODO: replace with an `isSuperAdmin` field on the User document
// so the check isn't tied to a specific email.
const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'floradmin05@gmail.com')
  .trim()
  .toLowerCase();

// Admin seed credentials — MUST be env vars in any shared repo.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'floradmin05@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // no default — required
const ADMIN_NAME = process.env.ADMIN_NAME || 'Flora';

// Password reset links expire after 30 minutes.
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

// Name change limit per calendar month.
const NAME_CHANGE_LIMIT = 3;

// Max photo length (base64 data URL) — roughly 500 KB.
const MAX_PHOTO_LENGTH = 700_000;

// Max phone length — plenty for any real phone number.
const MAX_PHONE_LENGTH = 30;

/* ---------- Env checks ---------- */

if (!RESEND_API_KEY) {
  console.error('❌ Missing RESEND_API_KEY in .env');
  process.exit(1);
}
if (!MONGODB_URI) {
  console.error('❌ Missing MONGODB_URI in .env');
  process.exit(1);
}
if (!ADMIN_PASSWORD && process.env.SEED_ADMIN === 'true') {
  console.error('❌ ADMIN_PASSWORD is required when SEED_ADMIN=true');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

/* ---------- Express ---------- */

const app = express();
app.use(express.json({ limit: '5mb' }));

// CORS — allow the frontend, with or without trailing slash
const allowedOrigins = [FRONTEND_URL, FRONTEND_URL + '/'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl / mobile
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
  })
);

/* ---------- MongoDB models ---------- */

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    photo: { type: String, default: '' },
    phone: { type: String, default: '' },
    nameChanges: {
      month: { type: String, default: '' },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

const recordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    kind: { type: String, required: true }, // 'expense' | 'income' | 'budget' | 'goal'
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

const Record = mongoose.model('Record', recordSchema);

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: { type: String, default: 'info' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    icon: { type: String, default: 'fa-bell' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

/* ---------- Helpers ---------- */

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    photo: user.photo || '',
    phone: user.phone || '',
    nameChanges: user.nameChanges || { month: '', count: 0 },
  };
}

function isSuperAdminEmail(email) {
  return typeof email === 'string' && email.trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}

function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Server-side password validation — must match the frontend rules.
function validatePassword(pw) {
  if (typeof pw !== 'string') return 'Password must be a string.';
  if (pw !== pw.trim()) return 'Password must not start or end with spaces.';
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(pw)) return 'Password must include an uppercase letter.';
  if (!/[a-z]/.test(pw)) return 'Password must include a lowercase letter.';
  if (!/[0-9]/.test(pw)) return 'Password must include a number.';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Password must include a special character.';
  return null;
}

/* ---------- Auth middleware ---------- */

function auth(required = true) {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;

      if (!token) {
        if (required) return res.status(401).json({ error: 'No token provided.' });
        return next();
      }

      const payload = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(payload.sub);
      if (!user) {
        if (required) return res.status(401).json({ error: 'User not found.' });
        return next();
      }

      req.user = user;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
  };
}

function adminOnly(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

function superAdminOnly(req, res, next) {
  if (!req.user || !isSuperAdminEmail(req.user.email)) {
    return res.status(403).json({ error: 'Only the main admin can perform this action.' });
  }
  next();
}

/* ---------- Health ---------- */

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

/* ---------- Auth routes ---------- */

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const pwErr = validatePassword(password);
    if (pwErr) return res.status(400).json({ error: pwErr });

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: String(name).trim(),
      email: cleanEmail,
      passwordHash,
      isAdmin: false,
    });

    // Welcome notification
    await Notification.create({
      user: user._id,
      type: 'welcome',
      title: 'Welcome to Finora',
      message: 'Log your first expense to get started.',
      icon: 'fa-hand-sparkles',
    });

    const token = signToken(user);
    res.json({ ok: true, token, user: publicUser(user) });
  } catch (err) {
    console.error('register error:', err.message);
    res.status(500).json({ error: 'Could not create account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Generic-ish response so we don't leak user existence by timing.
      // The frontend relies on the 'not-registered' shape for the
      // "create an account" prompt, so keep it.
      return res.status(404).json({ error: 'not-registered' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Incorrect password.' });
    }

    const token = signToken(user);
    res.json({ ok: true, token, user: publicUser(user) });
  } catch (err) {
    console.error('login error:', err.message);
    res.status(500).json({ error: 'Could not sign in.' });
  }
});

app.get('/api/auth/me', auth(true), (req, res) => {
  res.json({ ok: true, user: publicUser(req.user) });
});

app.put('/api/auth/profile', auth(true), async (req, res) => {
  try {
    const { name, email, phone, photo } = req.body || {};

    // --- Name change (rate limited) ---
    if (name && String(name).trim()) {
      const newName = String(name).trim();
      if (newName !== req.user.name) {
        const month = currentMonthKey();
        const stored = req.user.nameChanges || { month: '', count: 0 };
        const count = stored.month === month ? stored.count : 0;

        if (count >= NAME_CHANGE_LIMIT) {
          return res.status(400).json({
            error: "You've reached the name change limit for this month.",
          });
        }
        req.user.name = newName;
        req.user.nameChanges = { month, count: count + 1 };
      }
    }

    // --- Email change (uniqueness check) ---
    if (email && String(email).trim()) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (cleanEmail !== req.user.email) {
        const existing = await User.findOne({ email: cleanEmail });
        if (existing) {
          return res.status(400).json({ error: 'That email is already in use.' });
        }
        req.user.email = cleanEmail;
      }
    }

    // --- Phone (length-capped) ---
    if (typeof phone === 'string') {
      if (phone.length > MAX_PHONE_LENGTH) {
        return res.status(400).json({ error: 'Phone number is too long.' });
      }
      req.user.phone = phone;
    }

    // --- Photo (length-capped) ---
    if (typeof photo === 'string') {
      if (photo.length > MAX_PHOTO_LENGTH) {
        return res.status(400).json({ error: 'Photo is too large.' });
      }
      req.user.photo = photo;
    }

    await req.user.save();
    res.json({ ok: true, user: publicUser(req.user) });
  } catch (err) {
    console.error('profile update error:', err.message);
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

app.put('/api/auth/password', auth(true), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords are required.' });
    }

    const pwErr = validatePassword(newPassword);
    if (pwErr) return res.status(400).json({ error: pwErr });

    const match = await bcrypt.compare(currentPassword, req.user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    req.user.passwordHash = await bcrypt.hash(newPassword, 10);
    await req.user.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('password update error:', err.message);
    res.status(500).json({ error: 'Could not update password.' });
  }
});

/* ---------- Data routes ---------- */

// Fields a client is allowed to set on a record.
// Anything else is discarded. `id` is managed by Mongo.
function sanitizeRecordData(kind, data) {
  if (!data || typeof data !== 'object') return {};
  const { id: _ignored, ...rest } = data;
  return rest;
}

app.get('/api/records/:kind', auth(true), async (req, res) => {
  try {
    const { kind } = req.params;
    const rows = await Record.find({ user: req.user._id, kind }).sort({ createdAt: -1 });
    res.json({
      ok: true,
      records: rows.map((r) => ({ id: r._id.toString(), ...r.data })),
    });
  } catch (err) {
    console.error('list records error:', err.message);
    res.status(500).json({ error: 'Could not load records.' });
  }
});

app.post('/api/records/:kind', auth(true), async (req, res) => {
  try {
    const { kind } = req.params;
    const data = sanitizeRecordData(kind, req.body);
    const row = await Record.create({ user: req.user._id, kind, data });
    res.json({ ok: true, record: { id: row._id.toString(), ...row.data } });
  } catch (err) {
    console.error('create record error:', err.message);
    res.status(500).json({ error: 'Could not save record.' });
  }
});

app.put('/api/records/:kind/:id', auth(true), async (req, res) => {
  try {
    const { id } = req.params;
    const row = await Record.findOne({ _id: id, user: req.user._id });
    if (!row) return res.status(404).json({ error: 'Record not found.' });

    const update = sanitizeRecordData(req.params.kind, req.body);
    row.data = { ...row.data, ...update };
    await row.save();

    res.json({ ok: true, record: { id: row._id.toString(), ...row.data } });
  } catch (err) {
    console.error('update record error:', err.message);
    res.status(500).json({ error: 'Could not update record.' });
  }
});

app.delete('/api/records/:kind/:id', auth(true), async (req, res) => {
  try {
    const { id } = req.params;
    const row = await Record.findOneAndDelete({ _id: id, user: req.user._id });
    if (!row) return res.status(404).json({ error: 'Record not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error('delete record error:', err.message);
    res.status(500).json({ error: 'Could not delete record.' });
  }
});

/* ---------- Admin routes ---------- */

app.get('/api/admin/users', auth(true), adminOnly, async (req, res) => {
  try {
    const users = await User.find(
      {},
      '_id name email isAdmin createdAt photo phone'
    ).sort({ createdAt: -1 });

    const counts = await Record.aggregate([
      { $group: { _id: { user: '$user', kind: '$kind' }, count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((row) => {
      const userId = row._id.user.toString();
      const kind = row._id.kind;
      if (!countMap[userId]) countMap[userId] = {};
      countMap[userId][kind] = row.count;
    });

    const list = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      isAdmin: u.isAdmin,
      photo: u.photo || '',
      phone: u.phone || '',
      createdAt: u.createdAt,
      counts: countMap[u._id.toString()] || {
        expense: 0,
        income: 0,
        budget: 0,
        goal: 0,
      },
    }));

    res.json({ ok: true, users: list });
  } catch (err) {
    console.error('admin list error:', err.message);
    res.status(500).json({ error: 'Could not load users.' });
  }
});

app.delete('/api/admin/users/:id', auth(true), adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ error: 'User not found.' });

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You can't delete your own account." });
    }

    if (isSuperAdminEmail(target.email)) {
      return res.status(400).json({ error: 'The main admin cannot be deleted.' });
    }

    // Clean up everything owned by the target user
    await Record.deleteMany({ user: target._id });
    await Notification.deleteMany({ user: target._id });
    await target.deleteOne();

    res.json({ ok: true });
  } catch (err) {
    console.error('admin delete error:', err.message);
    res.status(500).json({ error: 'Could not delete user.' });
  }
});

app.put('/api/admin/users/:id/promote', auth(true), superAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (user.isAdmin) {
      return res.status(400).json({ error: 'This user is already an admin.' });
    }

    user.isAdmin = true;
    await user.save();

    await Notification.create({
      user: user._id,
      type: 'promoted',
      title: 'You are now an admin',
      message: 'You have been promoted to admin. You can now access the Admin page.',
      icon: 'fa-shield-halved',
    });

    res.json({ ok: true, user: publicUser(user) });
  } catch (err) {
    console.error('admin promote error:', err.message);
    res.status(500).json({ error: 'Could not promote user.' });
  }
});

app.put('/api/admin/users/:id/demote', auth(true), superAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const target = await User.findById(id);
    if (!target) return res.status(404).json({ error: 'User not found.' });

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You can't demote yourself." });
    }

    if (isSuperAdminEmail(target.email)) {
      return res.status(400).json({ error: 'The main admin cannot be demoted.' });
    }

    if (target.isAdmin) {
      const adminCount = await User.countDocuments({ isAdmin: true });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'At least one admin must remain.' });
      }
    }

    target.isAdmin = false;
    await target.save();

    await Notification.create({
      user: target._id,
      type: 'demoted',
      title: 'Admin access removed',
      message: 'Your admin privileges have been removed. You now have regular user access.',
      icon: 'fa-user',
    });

    res.json({ ok: true, user: publicUser(target) });
  } catch (err) {
    console.error('admin demote error:', err.message);
    res.status(500).json({ error: 'Could not demote user.' });
  }
});

/* ---------- Notifications ---------- */

app.get('/api/notifications', auth(true), async (req, res) => {
  try {
    const list = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      ok: true,
      notifications: list.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        icon: n.icon,
        read: n.read,
        time: n.createdAt,
      })),
    });
  } catch (err) {
    console.error('notifications list error:', err.message);
    res.status(500).json({ error: 'Could not load notifications.' });
  }
});

app.put('/api/notifications/:id/read', auth(true), async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.updateOne(
      { _id: id, user: req.user._id },
      { $set: { read: true } }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('notification read error:', err.message);
    res.status(500).json({ error: 'Could not update notification.' });
  }
});

app.put('/api/notifications/read-all', auth(true), async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id },
      { $set: { read: true } }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('notification read-all error:', err.message);
    res.status(500).json({ error: 'Could not mark all as read.' });
  }
});

app.delete('/api/notifications/:id', auth(true), async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.deleteOne({ _id: id, user: req.user._id });
    res.json({ ok: true });
  } catch (err) {
    console.error('notification delete error:', err.message);
    res.status(500).json({ error: 'Could not delete notification.' });
  }
});

app.delete('/api/notifications', auth(true), async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ ok: true });
  } catch (err) {
    console.error('notification clear error:', err.message);
    res.status(500).json({ error: 'Could not clear notifications.' });
  }
});

/* ---------- Password reset ---------- */

const resetTokens = new Map();

// Periodically clean up expired tokens
setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of resetTokens) {
    if (now > entry.expiresAt) resetTokens.delete(token);
  }
}, 5 * 60 * 1000).unref();

app.post('/api/send-reset', async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + RESET_TOKEN_TTL_MS;
  resetTokens.set(token, { email: cleanEmail, expiresAt });

  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

  try {
  const result = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: cleanEmail,
    subject: 'Reset your Finora password',
    html: `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:auto;padding:24px;background:#FBF8F3;border-radius:12px;color:#1F2429;">
    <h1 style="color:#1F6E60;margin:0 0 12px;font-size:22px;">Reset your Finora password</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">
      Click the button below to choose a new password. This link expires in 30 minutes.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
      <tr>
        <td style="background:#1F6E60;border-radius:999px;">
          <a href="${resetLink}" target="_blank"
             style="display:inline-block;padding:12px 28px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
            Reset password
          </a>
        </td>
      </tr>
    </table>
    <p style="font-size:13px;line-height:1.6;color:#6B7280;margin:0 0 8px;">
      Or copy this link into your browser:
    </p>
    <p style="font-size:13px;line-height:1.6;color:#1F6E60;word-break:break-all;margin:0 0 20px;">
      <a href="${resetLink}" style="color:#1F6E60;text-decoration:underline;">${resetLink}</a>
    </p>
    <p style="font-size:12px;color:#6B7280;margin-top:24px;border-top:1px solid #E9E4DC;padding-top:16px;">
      Finora — Make every rupee count.
    </p>
  </div>
`,
  });

  console.log('📧 Resend response:', JSON.stringify(result, null, 2));

  return res.json({ ok: true });
} catch (err) {
  console.error('❌ Resend error:', err.message, err);
  return res.status(500).json({ error: 'Could not send reset email.' });
}
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    const entry = resetTokens.get(token);
    if (!entry) {
      return res.status(400).json({ error: 'Invalid or expired reset link.' });
    }
    if (Date.now() > entry.expiresAt) {
      resetTokens.delete(token);
      return res.status(400).json({ error: 'This reset link has expired.' });
    }

    const pwErr = validatePassword(newPassword);
    if (pwErr) return res.status(400).json({ error: pwErr });

    const user = await User.findOne({ email: entry.email });
    if (user) {
      user.passwordHash = await bcrypt.hash(newPassword, 10);
      await user.save();
    }

    resetTokens.delete(token);
    return res.json({ ok: true, email: entry.email });
  } catch (err) {
    console.error('reset-password error:', err.message);
    return res.status(500).json({ error: 'Could not reset password.' });
  }
});

/* ---------- Fallbacks ---------- */

// Unknown route → JSON 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Last-resort error handler → JSON 500
app.use((err, req, res, _next) => {
  console.error('unhandled error:', err.message);
  res.status(500).json({ error: 'Something went wrong.' });
});

/* ---------- Start ---------- */

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }

  // Seed the super admin only when explicitly enabled.
  if (process.env.SEED_ADMIN === 'true') {
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (!existing) {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash,
        isAdmin: true,
      });
      console.log('🛡️ Admin seeded:', ADMIN_EMAIL);
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Finora backend listening on http://localhost:${PORT}`);
    console.log(`   Frontend URL: ${FRONTEND_URL}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down…');
    server.close();
    await mongoose.connection.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();