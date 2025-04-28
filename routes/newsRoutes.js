import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import News from "../models/NewsModel.js";
import Category from "../models/CategoryModel.js";
import mongoose from "mongoose";
import streamifier from "streamifier";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Helper: upload to cloudinary using stream
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "news_images",
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// POST: Create a news article
router.post("/createnews", upload.single("image"), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const imageFile = req.file;

    if (!title || !content || !category) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existCategory = await Category.findOne({ name: category });
    if (!existCategory) {
      return res.status(404).json({ message: "Category not found." });
    }

    let imageUrl = null;
    if (imageFile) {
      const result = await streamUpload(imageFile.buffer);
      imageUrl = result.secure_url;
    }

    const news = new News({
      title,
      content,
      image: imageUrl,
      category: existCategory._id,
    });

    await news.save();
    res.status(201).json({ message: "News article posted successfully", news });
  } catch (err) {
    console.error("Error creating news article:", err);
    res
      .status(500)
      .json({ message: "Failed to create news article", error: err.message });
  }
});

// GET: Paginated fetch
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const newsArticles = await News.find()
      .populate("category", "name")
      .skip(skip)
      .limit(limit);

    if (!newsArticles.length) {
      return res.status(404).json({ message: "No news articles found." });
    }

    res.status(200).json({
      message: "News articles fetched successfully",
      newsArticles,
      page,
      limit,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch news articles", error: err.message });
  }
});

// PUT: Edit news article
router.put("/editnews/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const imageFile = req.file;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: "News article not found" });
    }

    if (category) {
      let existCategory;
      if (mongoose.Types.ObjectId.isValid(category)) {
        existCategory = await Category.findById(category);
      } else {
        existCategory = await Category.findOne({ name: category });
      }

      if (!existCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      news.category = existCategory._id;
    }

    if (title) news.title = title;
    if (content) news.content = content;

    if (imageFile) {
      const result = await streamUpload(imageFile.buffer);
      news.image = result.secure_url;
    }

    await news.save();
    res
      .status(200)
      .json({ message: "News article updated successfully", news });
  } catch (err) {
    console.error("Error updating news:", err);
    res
      .status(500)
      .json({ message: "Failed to update news", error: err.message });
  }
});

// DELETE: Remove a news article
router.delete("/deletenews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: "News article not found" });
    }

    if (news.image) {
      const publicId = news.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`news_images/${publicId}`);
    }

    await news.deleteOne();
    res.status(200).json({ message: "News article deleted successfully" });
  } catch (err) {
    console.error("Error deleting news:", err);
    res
      .status(500)
      .json({ message: "Failed to delete news", error: err.message });
  }
});

export default router;
