import { Careers } from "../models/careers.model.js";
import { Job } from "../models/job.model.js"; // Jobs Model

export const postCareers = async (req, res) => {
    try {
        const { companyName, careersLink } = req.body;

        if (!companyName || !careersLink) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false
            })
        };
        const careers = await Careers.create({
            companyName,
            careersLink,
        });
        return res.status(201).json({
            message: "New careers link added successfully.",
            careers,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

export const getAllCareers = async (req, res) => {
    try {
        const { companyName, careersLink } = req.query;

        // Build a query object based on the parameters provided
        const query = {};
        if (companyName) {
            query.companyName = companyName.trim();
        }
        if (careersLink) {
            query.careersLink = careersLink.trim();
        }

        // Fetch results from the database based on the query
        const careers = await Careers.find(query).sort({ createdAt: -1 });

        if (!careers || careers.length === 0) {
            return res.status(404).json({
                message: "No career links found.",
                success: false
            });
        }

        return res.status(200).json({
            careers,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred while fetching the links.",
            success: false
        });
    }
};

export const getRemoteCompaniesWithActiveJobs = async (req, res) => {
    try {
      // Step 1: Fetch all companies with remote: true
      const companies = await Careers.find({ remote: true });
  
      if (!companies.length) {
        return res.status(404).json({
          message: "No remote companies found.",
          success: false,
        });
      }
  
      // Step 2: Fetch active jobs for each company
      const companiesWithJobs = await Promise.all(
        companies.map(async (company) => {
          // Fetch active jobs for the current company
          const jobs = await Job.find({ company: company.companyName, status: "active" });
  
          return {
            companyName: company.companyName,
            remote: company.remote,
            jobs: jobs,
          };
        })
      );
  
      return res.status(200).json({
        success: true,
        companies: companiesWithJobs,
      });
    } catch (error) {
      console.error("Error fetching remote companies with active jobs:", error);
      return res.status(500).json({
        message: "An error occurred while fetching remote companies with active jobs.",
        success: false,
      });
    }
  };