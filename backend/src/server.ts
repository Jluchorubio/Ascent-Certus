import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import apiV1Routes from "./routes";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : true;

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

const publicPath = path.resolve(__dirname, "../public");
app.use(express.static(publicPath));

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/v1", apiV1Routes);

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "localhost";
app.listen(port, () => {
  const baseUrl = `http://${host}:${port}`;
  console.log(`API running on port ${port}`);
  console.log(`API base: ${baseUrl}/api/v1`);
  console.log(`Health: ${baseUrl}/health`);
  console.log(`Home: ${baseUrl}/`);
});
