import { Router, Request, Response } from "express";
import { uploadAudioToCloudinary } from "../utils/uploadPhoto";

const router = Router();

/**
 * POST /chat/upload-audio
 * Body: { audio: "data:audio/webm;base64,..." }
 * Returns: { url: "https://res.cloudinary.com/..." }
 */
router.post("/upload-audio", async (req: Request, res: Response): Promise<void> => {
    try {
        const { audio } = req.body;
        if (!audio) {
            res.status(400).json({ error: "No audio data provided" });
            return;
        }
        const url = await uploadAudioToCloudinary(audio);
        res.json({ url });
    } catch (err: any) {
        console.error("Audio upload failed:", err.message);
        res.status(500).json({ error: "Audio upload failed" });
    }
});

export default router;
