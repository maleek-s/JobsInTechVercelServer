import mongoose from 'mongoose';

const uri = "mongodb+srv://chizaa123:Jedandvatri123@cluster0.kzqe6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB with Mongoose!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

export default connectDB;
