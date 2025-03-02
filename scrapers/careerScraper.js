import puppeteer from "puppeteer";
import fs from "fs";
import axios from "axios";

// Configurations
const config = {
  apiUrl: "http://localhost:8000/api/v1/careers",
  waitTime: 9000,
  keywords: ["Jobs", "Vacancies", "Careers", "Career", "Job", "Work", "Work with us", "Join", "Join us", "Open positions", "Positions", "Join our team"],
  careerPaths: ["/career", "/career/", "/careers", "/careers/", "/join-us", "/join-us/", "/jobs", "/jobs/"],
};

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const getKeywordImportance = (keyword) => {
  const keywordImportanceMap = {
    careers: 10,
    career: 9,
    jobs: 8,
    join: 8,
  };
  return keywordImportanceMap[keyword.toLowerCase()] || 5;
};

const updateDatabase = async (companyName, careersLink) => {
  try {
    await axios.post(`${config.apiUrl}/post`, { companyName, careersLink });
    console.log("Database updated successfully");
  } catch (error) {
    console.error("Error updating the database:", error);
  }
};

const checkDatabaseEntry = async (companyName, careersLink) => {
  try {
    const response = await axios.get(`${config.apiUrl}/get`, {
      params: { companyName: companyName.trim(), careersLink: careersLink.trim() },
    });
    return response.data.careers && response.data.careers.length > 0;
  } catch (error) {
    console.error("Error checking database entry:", error);
    return false;
  }
};

const findCareersLinks = async (page) => {
    return await page.evaluate((keywords, careerPaths) => {
      const links = document.querySelectorAll("a");
      const uniqueLinks = new Set();
      const matchedKeywords = [];
  
      // Normalize paths for comparison
      const normalizedCareerPaths = careerPaths.map(path => path.toLowerCase().replace(/\/$/, ""));
  
      const careersLinks = Array.from(links).filter((link) => {
        const href = new URL(link.href, window.location.href).pathname.toLowerCase().replace(/\/$/, "");
        console.log('Evaluating link:', href);
        return normalizedCareerPaths.includes(href);
      });
  
      if (careersLinks.length > 0) {
        careersLinks.forEach((link) => {
          const fullLink = new URL(link.href, window.location.href).href;
          uniqueLinks.add(fullLink);
        });
        return { uniqueLinks: Array.from(uniqueLinks), matchedKeywords };
      }
  
      links.forEach((link) => {
        const matchedKeyword = keywords.find((keyword) =>
          link.textContent.includes(keyword)
        );
        if (matchedKeyword) {
          const fullLink = new URL(link.href, window.location.href).href;
          uniqueLinks.add(fullLink);
          matchedKeywords.push({
            link: fullLink,
            keyword: matchedKeyword,
          });
        }
      });
  
      return { uniqueLinks: Array.from(uniqueLinks), matchedKeywords };
    }, config.keywords, config.careerPaths);
  };
  
const processCompany = async (browser, companyName, websiteUrl) => {
  console.log(`Processing ${companyName} at ${websiteUrl}`);

  if (!isValidUrl(websiteUrl)) {
    console.error(`Error: Invalid Website URL for ${companyName}`);
    return;
  }

  const page = await browser.newPage();

  try {
    await page.goto(websiteUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(config.waitTime);

    const careersLinksArray = await findCareersLinks(page);

    const gradedLinks = careersLinksArray.matchedKeywords.map(({ link, keyword }) => ({
      link,
      grade: getKeywordImportance(keyword),
    }));

    const filteredLinks = gradedLinks.filter((link) => link.grade > 0);

    const firstCareersLink =
      filteredLinks.length > 0
        ? filteredLinks.sort((a, b) => b.grade - a.grade)[0].link
        : careersLinksArray.uniqueLinks[0];

    if (firstCareersLink) {
      const entryExists = await checkDatabaseEntry(companyName, firstCareersLink);
      if (!entryExists) {
        await updateDatabase(companyName, firstCareersLink);
      } else {
        console.log("Entry already exists in the database. Skipping...");
      }
    }

    console.log(`Company: ${companyName}, Careers Page Link: ${firstCareersLink}`);
  } catch (error) {
    console.error(`Error processing ${companyName} at ${websiteUrl}:`, error);
  } finally {
    await page.close();
  }
};

const careerScraper = async () => {
  const data = fs.readFileSync("./scrapers/helpers/mySpread.csv", "utf8").split("\n");
  const rows = data.map((row) => row.split(","));
  const browser = await puppeteer.launch();

  for (let i = 1; i < rows.length; i++) {
    const [companyName, websiteUrl] = rows[i];
    await processCompany(browser, companyName, websiteUrl);
  }

  await browser.close();
};

export const runCareerScraper = careerScraper;
