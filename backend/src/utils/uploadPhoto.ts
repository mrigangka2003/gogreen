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

/**
 * Upload a base64-encoded video to Cloudinary.
 * @param base64 - The full data-URI string (e.g. "data:video/mp4;base64,...")
 * @param folder - Cloudinary folder path
 * @returns The secure URL of the uploaded video
 */
export const uploadVideoToCloudinary = async (
    base64: string,
    folder: string = "gogreen/videos"
): Promise<string> => {
    const result = await cloudinary.uploader.upload(base64, {
        folder,
        resource_type: "video",
        format: "mp4",
    });
    return result.secure_url;
};

/**
 * Upload a base64-encoded audio file to Cloudinary.
 * @param base64 - The full data-URI string (e.g. "data:audio/webm;base64,...")
 * @param folder - Cloudinary folder path
 * @returns The secure URL of the uploaded audio
 */
export const uploadAudioToCloudinary = async (
    base64: string,
    folder: string = "gogreen/chat-audio"
): Promise<string> => {
    const result = await cloudinary.uploader.upload(base64, {
        folder,
        resource_type: "video", // Cloudinary treats audio as "video" resource type
        format: "webm",
    });
    return result.secure_url;
};
