import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import Category from "../models/CategoryModel.js";
import News from '../models/NewsModel.js'

const router = express.Router();

// Configure multer to use Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'categories',
    allowed_formats: ['jpeg', 'jpg', 'png', 'svg'],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({ storage });

// POST - Create category
router.post("/category", upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file?.path;

    if (!name || !image) {
      return res.status(400).json({ message: "Please fill all the required fields" });
    }

    const category = new Category({ name, image });
    await category.save();

    res.status(201).json({ message: "Category created successfully", category });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// PUT - Update category by ID
router.put("/category/:_id", upload.single('image'), async (req, res) => {
  try {
    const { _id } = req.params;
    const { name: newName } = req.body;
    const image = req.file?.path;

    const category = await Category.findById(_id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.name = newName || category.name;
    category.image = image || category.image;
    await category.save();

    res.status(200).json({ message: "Category updated successfully", category });
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// DELETE - Delete category by ID
router.delete("/category/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Delete all posts related to this category
    const news = await News.find({ category: id });
    if (news.length > 0) {
      await News.deleteMany({ category: id });
    }

    const imageUrl = category.image;
    let cloudinaryResult = null;

    if (imageUrl) {
      const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
      cloudinaryResult = await cloudinary.uploader.destroy(`categories/${publicId}`);
    }

    await category.deleteOne();

    res.status(200).json({
      message: "Category and related posts deleted successfully",
      category,
      cloudinaryResult
    });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

// GET - All categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
