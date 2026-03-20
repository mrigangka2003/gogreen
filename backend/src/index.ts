import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

import { PORT } from "./constants";
import connectDB from "./config/db";
import router from "./routes";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://gogreenplus.in",
    "http://localhost:5174", // this port is being used for the  mobile app
];

// Allow any origin during development dynamically
const isDev = process.env.NODE_ENV !== "production";

app.use(
    cors({

        origin: function (origin, callback) {
            // Temporarily allow all origins
            callback(null, true);

            /* OLD CORS Config below for future use:
            // allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            // allow specific defined origins in production, or anything in local development
            if (allowedOrigins.indexOf(origin) !== -1 || isDev) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
            */
        },
        credentials: true,
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/v1", router);

//this is the same router as above only being used for the mobile
app.use("/api/mobile/v1", router);

app.get("/", (req: Request, res: Response) => {
    res.send("Everything is working");
});

connectDB()
    .then(() => {
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`✅ Server listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("Mongodb connection failed");
    });
