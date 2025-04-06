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
    remote: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const Careers = mongoose.model("Careers", careersSchema);
