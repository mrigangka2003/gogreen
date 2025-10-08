import dotenv from "dotenv";
import path from "path";

// Load .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = process.env.PORT || 8000 as any
const MONGODB_URI = process.env.MONGODB_URI as string ;
const DB_NAME :string = "gogreenplus"
const JWT_SECRET = process.env.JWT_SECRET as string;

export {
    PORT,
    MONGODB_URI,
    DB_NAME,
    JWT_SECRET
}