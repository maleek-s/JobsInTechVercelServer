import mongoose from "mongoose";

const careersSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    careersLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
export const Careers = mongoose.model("Careers", careersSchema);
