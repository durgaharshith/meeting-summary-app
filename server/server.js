// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import uploadRoutes from "./routes/uploadRoutes.js";
import summarizeRoutes from "./routes/summarizeRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));


// Middlewares
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Routes (no DB)
app.use("/api/upload", uploadRoutes);
app.use("/api/summarize", summarizeRoutes);
app.use("/api/share", shareRoutes);


// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));