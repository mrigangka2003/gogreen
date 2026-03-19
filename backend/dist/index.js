"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const constants_1 = require("./constants");
const db_1 = __importDefault(require("./config/db"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const allowedOrigins = [
    "http://localhost:5173",
    "https://gogreenplus.in",
    "http://localhost:5174", // this port is being used for the  mobile app
];
// Allow any origin during development dynamically
const isDev = process.env.NODE_ENV !== "production";
app.use((0, cors_1.default)({
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
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/api/v1", routes_1.default);
//this is the same router as above only being used for the mobile
app.use("/api/mobile/v1", routes_1.default);
app.get("/", (req, res) => {
    res.send("Everything is working");
});
(0, db_1.default)()
    .then(() => {
    app.listen(constants_1.PORT, "0.0.0.0", () => {
        console.log(`✅ Server listening on port ${constants_1.PORT}`);
    });
})
    .catch((err) => {
    console.log("Mongodb connection failed");
});
