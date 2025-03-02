import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";

export const saveJob = async (req, res) => {
  try {
    const userId = req.body.applicant; // Expecting applicant in the body
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).json({
        message: "Job id is required.",
        success: false,
      });
    }

    // Check if the user has already applied for the job
    const existingSavedJob = await User.findOne({
        _id: userId,
        appliedJobs: jobId,
      });
      

    if (existingSavedJob) {
      return res.status(400).json({
        message: "You have already applied for this job.",
        success: false,
      });
    }

    // Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    // Create a new application
    job.appliedUsers.push(userId);
    await job.save();

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    user.appliedJobs.push(jobId);
    await user.save();

    return res.status(201).json({
      message: "Job applied successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred.",
      success: false,
    });
  }
};

export const getSavedJobs = async (req, res) => {
    try {
      const userId = req.id;
  
      // Find the user and populate the appliedJobs array with job details
      const user = await User.findById(userId).populate({
        path: 'appliedJobs',  // Populate appliedJobs with the Job documents
        options: { sort: { createdAt: -1 } } // Sort jobs by creation date
      });
  
      if (!user || user.appliedJobs.length === 0) {
        return res.status(404).json({
          message: "No Applications",
          success: false,
        });
      }
  
      return res.status(200).json({
        applications: user.appliedJobs,  // Return the populated appliedJobs
        success: true,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "An error occurred.",
        success: false,
      });
    }
  };
  

  