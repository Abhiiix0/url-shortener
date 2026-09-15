import "dotenv/config";
import app from "./app.js";
import prisma from "./lib/prisma.js";

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