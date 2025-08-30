import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const connectCloudinary = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET_KEY,
    });
    console.log("Cloudinary Configured Successfully");
  } catch (error) {
    console.error("Cloudinary Configuration Failed:", error);
  }
};

// Unified upload helper
export const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
    folder, 
  });
    // delete local file after successful upload
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return result;
  } catch (error) {
    // delete local file even if upload fails
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
