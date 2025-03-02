import axios from "axios";
import puppeteer from "puppeteer";
import { jobKeywords } from "../helpers/jobKeywords.js";
import { jobContentScraper } from "../services/jobContentScraper.js"; // Import the new scraper function
import { jobCategories } from "../helpers/jobCategories.js"; // Import the jobCategories object

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

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

// Function to find job category based on the keyword
const findJobCategory = (keyword) => {
  for (const category in jobCategories) {
    if (jobCategories[category].includes(keyword.toLowerCase())) {
      return category;
    }
  }
  return "Miscellaneous"; // Default to Miscellaneous if no category is found
};

const extractJobLinks = async (page, jobKeywords) => {
  await page.waitForSelector("body");
  console.log("Page body loaded.");

  // Check for CAPTCHA by looking for a known pattern in the HTML (like iframe or a CAPTCHA-related element)
  const isCaptcha = await page.evaluate(() => {
    return document.querySelector("iframe[src*='captcha']") !== null;
  });

  if (isCaptcha) {
    console.log("CAPTCHA detected. Cannot proceed with scraping.");
    return [];
  }

  // Log inside page.evaluate() and return those logs back to Node.js
  const { jobLinks, logs } = await page.evaluate((jobKeywords) => {
    const logs = []; // Create a logs array to collect all log messages

    const links = Array.from(document.querySelectorAll("a"));
    logs.push(`Found ${links.length} anchor tags on the page.`);

    const jobLinks = links
      .map((link, index) => {
        logs.push(`\n--- Processing link #${index + 1} ---`);
        
        // Get the href and check if it's valid
        const href = link.href ? link.href.trim() : "";
        if (!href || href === "") {
          logs.push(`Invalid or empty href for link #${index + 1}, skipping.`);
          return null; // Skip links without valid href
        }
        
        logs.push(`Original link href: ${href}`);

        // Get the text to check for job keywords
        let textToCheck = link.innerText.trim().toLowerCase();
        logs.push(`Initial anchor text: "${textToCheck}"`);

        // Fallback logic for extracting text if the anchor tag's text is empty
        if (!textToCheck.trim()) {
          logs.push("Anchor text is empty, checking child elements...");
          const childTexts = Array.from(link.querySelectorAll("*"))
            .map((el) => el.innerText)
            .join(" ")
            .toLowerCase();
          textToCheck = childTexts;
          logs.push(`Combined text from child elements: "${textToCheck}"`);
        }

        if (!textToCheck.trim()) {
          logs.push("Still no meaningful text, checking sibling elements...");
          const siblingTexts = Array.from(link.parentNode.children)
            .filter((el) => el !== link) // Exclude the link itself
            .map((sibling) => sibling.innerText)
            .join(" ")
            .toLowerCase();
          textToCheck = siblingTexts;
          logs.push(`Combined text from sibling elements: "${textToCheck}"`);
        }

        logs.push(`Final combined text to check: "${textToCheck}"`);

        // Find matching keyword
        const matchedKeyword = jobKeywords.find((keyword) =>
          textToCheck.includes(
            keyword
              .toLowerCase()
              .replace(/\s*\(.*?\)\s*/g, "")
          )
        );

        if (matchedKeyword) {
          logs.push(`Found matching keyword: "${matchedKeyword}" for link href: ${href}`);
        } else {
          logs.push(`No matching keyword found for link href: ${href}`);
        }

        // Return the job link if a matching keyword is found
        return matchedKeyword ? { href, keyword: matchedKeyword } : null;
      })
      .filter(Boolean); // Filter out null values

    // Return both the jobLinks and the collected logs
    return { jobLinks, logs };
  }, jobKeywords);

  // Output all logs from the page.evaluate() context
  logs.forEach(log => console.log(log));

  return jobLinks;
};


const extractContent = async (page, href) => {
  console.log(`Starting extraction for href: ${href}`);

  // Try to find the anchor element that matches the href
  let linkHandle = await page.$(
    `a[href^="${new URL(href).origin}"][href*="${new URL(href).pathname}"]`
  );
  console.log(
    `Exact match attempt for href "${href}" resulted in: ${
      linkHandle ? "Found" : "Not Found"
    }`
  );

  if (!linkHandle) {
    console.log(`No link found matching href: ${href}`);
    return null;
  }

  console.log(`Link handle found for href: ${href}. Extracting content...`);

  // Extract the text content directly from the anchor element or its children
  const content = await page.evaluate((link) => {
    // Attempt to get the text directly from the anchor element
    let text = link.innerText?.trim() || "";

    // If there's no direct innerText, gather text from all child elements
    if (!text) {
      const childTexts = Array.from(link.querySelectorAll("*"))
        .map((child) => child.innerText?.trim())
        .filter(Boolean); // Remove empty strings
      text = childTexts.join(" "); // Join all child text together
    }

    return text;
  }, linkHandle);

  // Log the content extracted
  console.log(
    `Extracted content for href: ${href} -> Content: "${
      content ? content : "No content found"
    }"`
  );

  return content;
};

const shouldExcludeLink = (content) => {
  console.log(`Checking if content should be excluded: "${content}"`);
  const excluded = exclusionKeywords.some((keyword) =>
    content.toLowerCase().includes(keyword)
  );
  console.log(`Should exclude: ${excluded}`);
  return excluded;
};

const processJobLinks = async (
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
    
    // Map scraped content into formatted job content
    const formattedJobContent = scrapedContent.map((item) => {
      const [heading, content] = Object.entries(item)[0];
      return { heading, content };
    });

    const jobCategory = findJobCategory(keyword);
    
    // Create the job data object
    const jobData = {
      title: keyword,
      description: content,
      jobLink: href,
      company: companyName,
      jobContent: formattedJobContent,
      jobCategory: jobCategory,
    };
    
    try {
      // Wait for the axios response before processing the next link
      await axios.post("http://localhost:8000/api/v1/job/post", jobData);
      console.log("Job posted successfully:", jobData);
    
      // Mark the job link as visited only after successful posting
      visitedJobLinks.add(href);
    } catch (error) {
      console.error(
        `Failed to post job data:\nTitle: ${jobData.title},\nDescription: ${jobData.description},\nCompany: ${jobData.company},\nJob Link: ${jobData.jobLink},\nJob Content: ${JSON.stringify(jobData.jobContent, null, 2)}\nError: ${error.message}`
      );
    }}
    

  // Deactivate jobs that are no longer present
  try {
    await axios.post("http://localhost:8000/api/v1/job/deactivate", {
      company: companyName,
      currentJobLinks,
    });
  } catch (error) {
    console.error(
      `Failed to deactivate outdated jobs for ${companyName}: ${error.message}`
    );
  }
};
const scrapeCompany = async (browser, company, visitedJobLinks) => {
  const { companyName, careersLink } = company;
  console.log(`Processing ${companyName} at ${careersLink}`);
  const page = await browser.newPage();

  try {
    await page.goto(careersLink, { waitUntil: "networkidle2" });
    await sleep(15000); // Initial wait time for page load

    // Pass jobKeywords to extractJobLinks
    let jobLinks = await extractJobLinks(page, jobKeywords); // Corrected line
    console.log(`Extracted job links: ${jobLinks.length}`, jobLinks);

    if (jobLinks.length === 0) {
      const baseUrl = await page.url(); // Get the base URL
  
      const viewPositionsHref = await page.evaluate((baseUrl) => {
          const element = Array.from(document.querySelectorAll("a, button")).find(
              (el) => {
                  // Get the innerText of the element itself
                  let textToCheck = el.textContent.trim();
  
                  // Also gather text from all child elements
                  const childTexts = Array.from(el.querySelectorAll("*"))
                      .map((child) => child.textContent.trim())
                      .filter(Boolean); // Filter out empty strings
  
                  // Join element's own text with its children's text
                  textToCheck = [textToCheck, ...childTexts].join(" ").trim();
  
                  // Debugging log to see what text is being checked
                  console.log(`Checking text: ${textToCheck}`);
  
                  // Check for matching keywords in both the element's text and its children's text
                  const matched =
                      /(open positions|all jobs|job openings|career opportunities|available positions|current openings|see jobs|open roles|see our open positions|view open roles|see all openings|view openings|join our team)/i.test(
                          textToCheck.replace(/&nbsp;/g, " ") // Ensure all &nbsp; are replaced too
                      );
  
                  return matched ? el : null; // Return the matched element
              }
          );
  
          // If a matched element is found, determine its href
          if (element) {
              let href = element.getAttribute("href");
  
              // If the href is relative, prepend the base URL
              if (href && !href.startsWith("http")) {
                  href = new URL(href, baseUrl).href; // Create absolute URL
              }
  
              return href; // Return the final URL
          }
  
          return null; // Return null if no matching element found
      }, baseUrl);
  
      if (viewPositionsHref) {
          console.log(`Found alternative link to job positions: ${viewPositionsHref}`);
          await page.goto(viewPositionsHref, { waitUntil: "domcontentloaded" });
          jobLinks = await extractJobLinks(page);
          console.log(`Extracted job links from alternative page: ${jobLinks.length}`, jobLinks);
      } else {
          console.log("No alternative job links found.");
      }
  } else {
      console.log("Job links found, skipping alternative search.");
  }
  

    await processJobLinks(companyName, page, jobLinks, visitedJobLinks);
  } catch (error) {
    console.error(`Error processing ${companyName} at ${careersLink}:`, error);
  } finally {
    await page.close();
  }
};


export const runJobScraperTextContent = async () => {
  try {
    const company = {
      companyName: "MoP",
      careersLink: "https://ministryofprogramming.com/en/careers#Open-Positions",
    };
    const browser = await puppeteer.launch();
    const visitedJobLinks = new Set();

    await scrapeCompany(browser, company, visitedJobLinks);

    await browser.close();
  } catch (error) {
    console.error("Error:", error);
  }
};

runJobScraperTextContent();
