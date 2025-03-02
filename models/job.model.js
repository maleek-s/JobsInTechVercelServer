import mongoose from "mongoose";

const jobContentSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  content: { type: [String], required: true },
});

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    jobLink: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    jobCategory: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    jobContent: { type: [jobContentSchema], required: true },

    appliedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  },
  { timestamps: true }
);
export const Job = mongoose.model("Job", jobSchema);
