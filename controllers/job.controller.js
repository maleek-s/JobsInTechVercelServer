import { Job } from "../models/job.model.js";

// admin post krega job
export const postJob = async (req, res) => {
  try {
    const { title, description, jobLink, company, jobContent, jobCategory } =
      req.body;

    if (
      !title ||
      !description ||
      !jobLink ||
      !company ||
      !jobContent ||
      !jobCategory
    ) {
      return res.status(400).json({
        message: "Something is missing.",
        success: false,
      });
    }

    // Upsert the job
    const job = await Job.findOneAndUpdate(
      { jobLink }, // Use jobLink as the unique identifier
      {
        title,
        description,
        company,
        status: "active",
        jobContent,
        jobCategory,
      }, // Update fields
      { new: true, upsert: true } // Create a new document if none exists
    );

    return res.status(201).json({
      message: "Job created or updated successfully.",
      job,
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

// Deactivate jobs not found in the latest scrape
export const deactivateJobs = async (req, res) => {
  try {
    const { company, currentJobLinks } = req.body;

    if (!company || !currentJobLinks) {
      return res.status(400).json({
        message: "Company name or job links are missing.",
        success: false,
      });
    }

    // Deactivate jobs not in the current scrape for the given company
    await Job.updateMany(
      { company, jobLink: { $nin: currentJobLinks }, status: "active" },
      { status: "inactive" }
    );

    return res.status(200).json({
      message: "Outdated jobs deactivated successfully.",
      success: true,
    });
  } catch (error) {
    console.log("Error deactivating outdated jobs:", error);
    return res.status(500).json({
      message: "An error occurred.",
      success: false,
    });
  }
};

// student k liye
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      status: "active", // Only fetch active jobs
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { company: { $regex: keyword, $options: "i" } },
      ],
    };

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    if (jobs.length === 0) {
      return res.status(404).json({
        message: "No jobs found.",
        success: false,
      });
    }

    return res.status(200).json({
      jobs,
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

// id
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
        success: false,
      });
    }
    if (job.status !== "active") {
      return res.status(404).json({
        message: "Job not active.",
        success: false,
      });
    }
    return res.status(200).json({ job, success: true });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred.",
      success: false,
    });
  }
};

export const getJobByCategory = async (req, res) => {
  try {
    const category = req.params.category;

    if (category) {
      // If category is provided, fetch jobs filtered by category
      const jobs = await Job.find({ jobCategory: category, status: "active" });
      if (jobs.length === 0) {
        return res.status(404).json({
          message: "No active jobs found for the given category.",
          success: false,
        });
      }
      return res.status(200).json({
        jobs,
        success: true,
      });
    } else {
      // If no category is provided, return all unique job categories with at least one active job
      const categories = await Job.aggregate([
        {
          $match: {
            status: "active",
            jobCategory: { $ne: null }, // Exclude null values
            jobCategory: { $ne: "" }, // Exclude empty strings
          },
        },
        { $group: { _id: "$jobCategory" } }, // Group by jobCategory
        { $project: { _id: 0, category: "$_id" } }, // Format the output
      ]);

      if (categories.length === 0) {
        return res.status(404).json({
          message: "No job categories with active jobs found.",
          success: false,
        });
      }
      return res.status(200).json({
        categories: categories.map((c) => c.category), // Return an array of category names
        success: true,
      });
    }
  } catch (error) {
    console.error("Error in getJobByCategory:", error);
    return res.status(500).json({
      message: "An error occurred while processing the request.",
      success: false,
    });
  }
};
export const searchJob = async (req, res) => {
  const query = req.query.query; // Access query parameter from req.query

  if (!query || query.length < 3) {
    return res
      .status(400)
      .json({ message: "Search query must be at least 3 characters long" });
  }

  try {
    // Perform a case-insensitive search in relevant fields and filter by active status
    const results = await Job.find({
      status: "active", // Ensure only active jobs are retrieved
      $or: [
        { description: { $regex: query, $options: "i" } },
        { company: { $regex: query, $options: "i" } },
        { title: { $regex: query, $options: "i" } },
      ],
    });

    res.json(results);
  } catch (error) {
    console.error("Error while searching:", error);
    res.status(500).json({ message: "Server error" });
  }
};

