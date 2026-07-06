import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

export const register = async (req, res) => {
  try {
    const { name, phone, password, role, skills, dailyRate, rateType, city, location } = req.body;

    if (!name || !phone || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(409).json({ message: "Phone number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role,
      skills: role === "worker" ? skills : undefined,
      dailyRate: role === "worker" ? dailyRate : undefined,
      rateType: role === "worker" ? rateType || "day" : undefined,
      city,
      location: location?.coordinates ? location : undefined,
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, role: user.role, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(401).json({ message: "Invalid phone or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid phone or password" });

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
