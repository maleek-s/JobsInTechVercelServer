import express from 'express';
import {Job} from '../models/job.model.js'; // Assuming you have a Job model

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
    try {
      // Fetch only active jobs from the database
      const jobs = await Job.find({ status: "active" }); 
  
      // Build the sitemap XML dynamically
      const baseUrl = 'https://jobsintech.live'; // Change to your domain
  
      let urls = jobs.map((job) => {
        return `<url>
          <loc>${baseUrl}/description/${job._id}</loc>
          <lastmod>${new Date(job.updatedAt).toISOString()}</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
        </url>`;
      });
  
      // Static URLs (e.g., home, about)
      urls.push(`
        <url>
          <loc>${baseUrl}/</loc>
          <changefreq>weekly</changefreq>
          <priority>1.0</priority>
        </url>
        <url>
          <loc>${baseUrl}/jobs</loc>
          <changefreq>monthly</changefreq>
          <priority>0.5</priority>
        </url>
      `);
  
      // Wrap URLs in sitemap structure
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          ${urls.join('')}
        </urlset>`;
  
      // Set headers and send XML response
      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

export default router;
