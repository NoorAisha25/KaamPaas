import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import { calculateTrustScore } from "./trustScore.js";

dotenv.config();

// Coordinates are [longitude, latitude] - MongoDB's GeoJSON order.
// Spread a few km apart around central Delhi so radius-based "nearby"
// search has something real to filter by, plus one worker in Mumbai to
// prove out-of-radius workers correctly get excluded.
const DEMO_WORKERS = [
  { name: "Ramesh Kumar", phone: "9000000001", skills: ["plumber"], dailyRate: 600, rateType: "day", city: "Delhi", location: { type: "Point", coordinates: [77.209, 28.6139] }, ratingAvg: 4.6, ratingCount: 23, jobsDone: 41, isVerified: true },
  { name: "Suresh Verma", phone: "9000000002", skills: ["mason"], dailyRate: 700, rateType: "day", city: "Delhi", location: { type: "Point", coordinates: [77.225, 28.6304] }, ratingAvg: 4.8, ratingCount: 30, jobsDone: 55, isVerified: true },
  { name: "Lakshmi Devi", phone: "9000000003", skills: ["home_cleaner"], dailyRate: 80, rateType: "hour", city: "Delhi", location: { type: "Point", coordinates: [77.195, 28.6129] }, ratingAvg: 4.9, ratingCount: 44, jobsDone: 88, isVerified: true },
  { name: "Mohan Lal", phone: "9000000004", skills: ["painter"], dailyRate: 650, rateType: "day", city: "Delhi", location: { type: "Point", coordinates: [77.218, 28.62] }, ratingAvg: 4.4, ratingCount: 12, jobsDone: 20, isVerified: true },
  { name: "Kavita Sharma", phone: "9000000005", skills: ["embroider"], dailyRate: 12000, rateType: "month", city: "Delhi", location: { type: "Point", coordinates: [77.21, 28.635] }, ratingAvg: 5.0, ratingCount: 8, jobsDone: 14, isVerified: true },
  { name: "Rajesh Yadav", phone: "9000000006", skills: ["electrician"], dailyRate: 800, rateType: "day", city: "Mumbai", location: { type: "Point", coordinates: [72.8777, 19.076] }, ratingAvg: 4.7, ratingCount: 19, jobsDone: 33, isVerified: true },
];

const DEMO_HIRER = {
  name: "Ramesh",
  phone: "8000000001",
  password: "demo1234",
  role: "hirer",
  city: "New Delhi",
  location: { type: "Point", coordinates: [77.21, 28.6139] }, // central Delhi, close to most demo workers
};

// Default admin login - CHANGE THIS before deploying anywhere real.
// This is a plain login+password admin account for now, same auth
// system as everyone else, just with role="admin".
const DEFAULT_ADMIN = {
  name: "Admin",
  phone: "0000000000",
  password: "admin1234",
  role: "admin",
};

const seed = async () => {
  await connectDB();

  console.log("Clearing existing demo data...");
  await User.deleteMany({ phone: { $in: [...DEMO_WORKERS.map((w) => w.phone), DEMO_HIRER.phone, DEFAULT_ADMIN.phone] } });
  await Job.deleteMany({});

  console.log("Creating demo workers...");
  const hashedWorkerPassword = await bcrypt.hash("demo1234", 10);
  const createdWorkers = await User.insertMany(
    DEMO_WORKERS.map((w) => {
      const trustScore = calculateTrustScore({ ...w, cancelledJobs: 0 });
      return { ...w, password: hashedWorkerPassword, role: "worker", available: true, trustScore };
    })
  );

  console.log("Creating demo hirer (login: 8000000001 / demo1234)...");
  const hashedHirerPassword = await bcrypt.hash(DEMO_HIRER.password, 10);
  const hirer = await User.create({
    ...DEMO_HIRER,
    password: hashedHirerPassword,
    jobsDone: 12,
    ratingAvg: 4.7,
    ratingCount: 9,
    trustScore: calculateTrustScore({ ratingAvg: 4.7, jobsDone: 12, cancelledJobs: 0, isVerified: false }),
  });

  console.log("Creating an OPEN sample job (for the normal apply/accept flow)...");
  await Job.create({
    hirer: hirer._id,
    skill: "sweeper",
    title: "clean home",
    description: "Need someone to clean a 2BHK apartment today",
    budget: 500,
    city: "New Delhi",
    location: { type: "Point", coordinates: [77.211, 28.614] },
    urgency: "today",
    status: "open",
  });

  console.log("Creating a COMPLETED sample job (so you can demo the review flow immediately)...");
  await Job.create({
    hirer: hirer._id,
    worker: createdWorkers[0]._id, // Ramesh Kumar the plumber
    skill: "plumber",
    title: "Fix leaking kitchen tap",
    description: "Tap has been dripping for two days",
    budget: 400,
    city: "New Delhi",
    location: { type: "Point", coordinates: [77.209, 28.6139] },
    urgency: "normal",
    status: "completed",
    completedAt: new Date(),
  });

  console.log("Creating default admin account (CHANGE THIS PASSWORD before going live)...");
  const hashedAdminPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
  await User.create({ ...DEFAULT_ADMIN, password: hashedAdminPassword });

  console.log(`Seeded ${createdWorkers.length} workers, 1 hirer, 1 admin, 2 jobs (1 open, 1 completed and ready to review).`);
  console.log("All Delhi demo workers are within ~5km of the demo hirer, for testing nearby-search.");
  console.log("Demo hirer login -> phone: 8000000001, password: demo1234");
  console.log("Admin login -> phone: 0000000000, password: admin1234 (CHANGE THIS)");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
