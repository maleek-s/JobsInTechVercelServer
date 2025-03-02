import axios from "axios";
import { sleep } from "../helpers/sleep.js";
import { extractContent } from "../helpers/contentExtractor.js";
import { jobContentScraper } from "./jobContentScraper.js"; // Import the new scraper function
import { jobCategories } from "../helpers/jobCategories.js"; // Import the jobCategories object

// Keywords for excluding links
const exclusionKeywords = [
  "privacy policy",
  "customer success stories",
  "for developers",
  "customer success management",
  "contact customer solutions",
  "error",
  "cookie",
];

const shouldExcludeLink = (content) => {
  return exclusionKeywords.some((keyword) =>
    content.toLowerCase().includes(keyword)
  );
};

// Function to find job category based on the keyword
const findJobCategory = (keyword) => {
  const lowerCaseKeyword = keyword.toLowerCase().trim();

  for (const category in jobCategories) {
    if (jobCategories[category].some((jobTitle) => jobTitle.toLowerCase() === lowerCaseKeyword)) {
      return category;
    }
  }
  return "Miscellaneous"; // Default if no category is found
};


export const processJobLinks = async (
  companyName,
  page,
  jobLinks,
  visitedJobLinks
) => {
  const currentJobLinks = [];

  for (const { href, keyword } of jobLinks) {
    currentJobLinks.push(href); // Track current job links

    // Log the job links and keywords being processed
    console.log(`Processing job link: ${href}, keyword: ${keyword}`);

    if (visitedJobLinks.has(href)) {
      console.log(`Skipping link (already visited): ${href}`);
      continue;
    }

    await sleep(3000); // Delay before extracting content
    let content = await extractContent(page, href);

    // If no content is found, use the matched keyword as content
    if (!content) {
      content = keyword; // Use the keyword as the content
    } else if (shouldExcludeLink(content)) {
      continue;
    } else if (content.length > 150) {
      // Truncate content to 150 characters and append ellipsis
      content = content.substring(0, 150) + "...";
    }

    // Call the new scraper function to get the job content
    const scrapedContent = await jobContentScraper(href);

    const formattedJobContent = scrapedContent.map((item) => {
      const [heading, content] = Object.entries(item)[0];
      return { heading, content };
    });

    // Find the job category for the current keyword
    const jobCategory = findJobCategory(keyword);

    const jobData = {
      title: keyword,
      description: content,
      jobLink: href,
      company: companyName,
      jobContent: formattedJobContent,
      jobCategory: jobCategory, // Include the job category in the post request
    };

    try {
      await axios.post("https://jobsintech.live/api/v1/job/post", jobData);
      console.log("Job posted successfully:", jobData);
      visitedJobLinks.add(href); // Mark the job link as visited
    } catch (error) {
      console.error(
        `Failed to post job data for ${companyName}: ${error.message}`
      );
    }
  }

  // Deactivate jobs that are no longer present
  try {
    await axios.post("https://jobsintech.live/api/v1/job/deactivate", {
      company: companyName,
      currentJobLinks,
    });
  } catch (error) {
    console.error(
      `Failed to deactivate outdated jobs for ${companyName}: ${error.message}`
    );
  }
};
