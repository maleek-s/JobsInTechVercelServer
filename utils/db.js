import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://chizaa123:Jedandvatri123@cluster0.kzqe6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let cached = global.mongoose || { conn: null, promise: null };

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI, {
        }).then((mongoose) => {
            return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

global.mongoose = cached;
export default connectDB;

