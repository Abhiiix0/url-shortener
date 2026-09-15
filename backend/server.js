import "dotenv/config";
import express from "express";
import prisma from "./lib/prisma.js";

const app = express();

const PORT = 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);
    process.exit(1);
  }
}

startServer();