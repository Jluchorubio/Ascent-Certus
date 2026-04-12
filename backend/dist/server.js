"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set("trust proxy", 1);
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : true;
app.use((0, cors_1.default)({ origin: corsOrigins, credentials: true }));
app.use(express_1.default.json());
const publicPath = path_1.default.resolve(__dirname, "../public");
app.use(express_1.default.static(publicPath));
app.get("/", (_req, res) => {
    res.sendFile(path_1.default.join(publicPath, "index.html"));
});
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
app.use("/api/v1", routes_1.default);
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "localhost";
app.listen(port, () => {
    const baseUrl = `http://${host}:${port}`;
    console.log(`API running on port ${port}`);
    console.log(`API base: ${baseUrl}/api/v1`);
    console.log(`Health: ${baseUrl}/health`);
    console.log(`Home: ${baseUrl}/`);
});
