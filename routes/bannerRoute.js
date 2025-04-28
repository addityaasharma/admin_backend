import express from "express";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import Banner from "../models/bannerModel.js";

const router = express.Router();

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "banner",
        allowed_formats: ["jpeg", "jpg", "png", "sveg"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
    },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
    try {
        const { link } = req.body;
        const image = req.file?.path;

        if (!link || !image) {
            return res.status(400).json({ message: "No link, image found" });
        }

        const bannerImage = new Banner({ image, link });
        await bannerImage.save();
                                                                                                                                                                                            
        return res.status(201).json({ message: "Banner has been created successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/", async (req, res) => {
    try {
        const bannerInfo = await Banner.find();
                                                                               
        if (bannerInfo.length > 0) {
            return res.status(200).json({ message: "Categories fetched", info: bannerInfo });
        } else {
            return res.status(404).json({ message: "No banners found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/:_id", upload.single("image"), async (req, res) => {
    try {
        const image = req.file?.path;
        const _id = req.params._id;
        const link = req.body.link;

        if (!_id) {
            return res.status(400).json({ message: "Banner ID not provided" });
        }
                                                                           
        const exist_banner = await Banner.findById(_id);
        if (!exist_banner) {
            return res.status(404).json({ message: "Banner does not exist" });
        }

        exist_banner.image = image || exist_banner.image;
        exist_banner.link = link || exist_banner.link;

        await exist_banner.save();
        return res.status(200).json({ message: "Banner has been saved successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Banner id is required" });
        }

        const existBanner = await Banner.findById(id);
        if (!existBanner) {
            return res.status(404).json({ message: "No Banner found" });
        }
        await existBanner.deleteOne();

        return res.status(200).json({ message: "Deleted Successful" });

    } catch (error) {
        return res.status(500).json({ message: "Unable to delete", error: error.message });
    }
});

export default router;
