// Removes the demo accounts created by seedDemoData.js (the 6 demo
// workers + 1 demo hirer), along with any jobs/reviews tied to them -
// without touching real accounts like Noor, aisha, Rida, Farz, etc.
// The admin account is intentionally NOT deleted here.
//
// Usage: npm run demo:delete

import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Review from "../models/Review.js";

dotenv.config();

// Must match the phone numbers used in seedDemoData.js
const DEMO_PHONES = [
  "9000000001", // Ramesh Kumar
  "9000000002", // Suresh Verma
  "9000000003", // Lakshmi Devi
  "9000000004", // Mohan Lal
  "9000000005", // Kavita Sharma
  "9000000006", // Rajesh Yadav
  "8000000001", // demo hirer
];

const run = async () => {
  await connectDB();

  const demoUsers = await User.find({ phone: { $in: DEMO_PHONES } });

  if (demoUsers.length === 0) {
    console.log("No demo accounts found - nothing to delete.");
    process.exit(0);
  }

  console.log(`Found ${demoUsers.length} demo account(s) to remove:`);
  demoUsers.forEach((u) => console.log(` - ${u.name} (${u.phone}, ${u.role})`));

  const demoUserIds = demoUsers.map((u) => u._id);

  const jobResult = await Job.deleteMany({
    $or: [{ hirer: { $in: demoUserIds } }, { worker: { $in: demoUserIds } }],
  });
  console.log(`Deleted ${jobResult.deletedCount} job(s) linked to demo accounts.`);

  const reviewResult = await Review.deleteMany({
    $or: [{ fromUser: { $in: demoUserIds } }, { toUser: { $in: demoUserIds } }],
  });
  console.log(`Deleted ${reviewResult.deletedCount} review(s) linked to demo accounts.`);

  const userResult = await User.deleteMany({ _id: { $in: demoUserIds } });
  console.log(`Deleted ${userResult.deletedCount} demo user account(s).`);

  console.log("Done. Your admin account and all real signups were left untouched.");
  process.exit(0);
};

run().catch((err) => {
  console.error("Failed to delete demo data:", err.message);
  process.exit(1);
});