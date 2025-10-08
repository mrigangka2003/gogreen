import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { PORT } from "./constants";
import connectDB from "./config/db";
import router from "./routes";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://gogreenplus.in",
]

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", router);

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
