const mongoose = require("mongoose");

const LOCAL_FALLBACK_URI = "mongodb://127.0.0.1:27017/medicare";

function resolveMongoUri() {
  const envUri = process.env.MONGO_URI?.trim();
  if (
    envUri &&
    (envUri.startsWith("mongodb://") || envUri.startsWith("mongodb+srv://"))
  ) {
    return envUri;
  }
  return LOCAL_FALLBACK_URI;
}

const connectDB = async () => {
  const uri = resolveMongoUri();
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    const isAtlas = uri.startsWith("mongodb+srv://");
    console.log(
      `MongoDB connected successfully (${isAtlas ? "Cloud Atlas" : "Local"})`
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;
