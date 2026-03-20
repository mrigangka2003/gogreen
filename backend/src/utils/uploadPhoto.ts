import cloudinary from "../config/cloudinary";

/**
 * Upload a base64-encoded image to Cloudinary.
 * @param base64 - The full data-URI string (e.g. "data:image/png;base64,...")
 * @param folder - Cloudinary folder path
 * @returns The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (
    base64: string,
    folder: string = "gogreen/reference-photos"
): Promise<string> => {
    const result = await cloudinary.uploader.upload(base64, {
        folder,
        resource_type: "image",
        transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
        ],
    });
    return result.secure_url;
};
