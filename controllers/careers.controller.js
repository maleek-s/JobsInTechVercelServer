import { Careers } from "../models/careers.model.js";

// admin post krega job
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