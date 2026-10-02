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
  const result = await User.updateMany({}, { $unset: { isMainAdmin: '' } });
  console.log('Updated:', result);
  const users = await User.find({}, 'name email isAdmin isMainAdmin');
  console.log(users);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});