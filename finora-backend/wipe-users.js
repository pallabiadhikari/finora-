import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'node:dns';

dns.setServers(['1.1.1.1', '8.8.8.8']);
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({}, { strict: false });
const recordSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);
const Record = mongoose.model('Record', recordSchema);

const KEEP_EMAIL = 'floradmin05@gmail.com'; // ← change if needed

async function run() {
  await mongoose.connect(MONGODB_URI);

  // Delete records of every user EXCEPT FLora
  const flora = await User.findOne({ email: KEEP_EMAIL });
  if (!flora) {
    console.error('FLora not found. Check KEEP_EMAIL.');
    process.exit(1);
  }

  const otherUsers = await User.find({ email: { $ne: KEEP_EMAIL } });
  const otherIds = otherUsers.map((u) => u._id);

  console.log(`Deleting ${otherIds.length} other user(s)...`);

  await Record.deleteMany({ user: { $in: otherIds } });
  await User.deleteMany({ _id: { $in: otherIds } });

  console.log('✅ Done. Remaining users:');
  const remaining = await User.find({}, 'name email isAdmin isMainAdmin');
  console.log(remaining);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});