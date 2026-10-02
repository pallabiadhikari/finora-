import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'node:dns';

dns.setServers(['1.1.1.1', '8.8.8.8']);
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  const result = await User.updateOne(
    { email: 'floradmin05@gmail.com' },
    { $set: { isAdmin: true, isMainAdmin: true } }
  );
  console.log('Updated:', result);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});