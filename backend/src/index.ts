import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";

import { PORT } from "./constants";
import connectDB from "./config/db";
import router from "./routes";

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
    res.send("Everything is working");
});

connectDB()
    .then(() => {
        app.listen(PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : http://localhost:8000`);
        });
    })
    .catch((err) => {
        console.log("Mongodb connection failed");
    });
