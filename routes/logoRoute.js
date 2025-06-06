import express from "express";
import { Logo } from "../models/logoModel.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "logo",
    allowed_formats: ["jpeg", "jpg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({ storage });

// POST - Create logo (only if not exists)
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const image = req.file?.path;

    if (!image) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const existingLogo = await Logo.findOne();

    if (existingLogo) {
      return res
        .status(400)
        .json({ message: "Logo already exists. Use PUT to update." });
    }

    const newLogo = new Logo({ image });
    await newLogo.save();
    res
      .status(201)
      .json({ message: "Logo created successfully", image: newLogo.image });
  } catch (error) {
    console.error("Error creating logo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT - Update existing logo or create if none exists
router.put("/", upload.single("logo"), async (req, res) => {
  try {
    const image = req.file?.path;

    if (!image) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    let logo = await Logo.findOne();

    if (logo) {
      logo.image = image;
      await logo.save();
      return res
        .status(200)
        .json({ message: "Logo updated successfully", image: logo.image });
    } else {
      // Create new
      const newLogo = new Logo({ image });
      await newLogo.save();
      return res
        .status(201)
        .json({ message: "Logo created successfully", image: newLogo.image });
    }
  } catch (error) {
    console.error("Error updating/creating logo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET - Get the existing logo
router.get("/", async (req, res) => {
  try {
    const logo = await Logo.findOne();
    if (logo) {
      return res.status(200).json({ image: logo.image });
    } else {
      return res.status(404).json({ message: "Logo not found" });
    }
  } catch (error) {
    console.error("Error fetching logo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
