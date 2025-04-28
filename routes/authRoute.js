import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userAuth } from "../models/userModel.js";

const router = express.Router();
const JWT_SECRET = "thisismysecretkey";

// Register API
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "username or password missing" });
    }

    const existingUser = await userAuth.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashPass = await bcrypt.hash(password, 10);

    const newUser = new userAuth({
      username,
      password: hashPass,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Login API
router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const user = await userAuth.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userID: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        username: user.username,
        _id: user._id,
        // panelData: user.panelData,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
});

export default router;