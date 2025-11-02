import mongoose from "mongoose";

export default function connectDB() {
  //check if mongoose is already connected
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  mongoose.connect(process.env.MONGODB_URI as string, {});
}
