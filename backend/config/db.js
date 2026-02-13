import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log("MongoDb connected!");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        // Throw error so server knows startup failed
        throw error;
    }
}
