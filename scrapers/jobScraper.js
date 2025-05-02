import puppeteer from "puppeteer";
import { sleep } from "./helpers/sleep.js"; 
import { processJobLinks } from "./services/jobService.js";
import { fetchCompanies } from "./services/companyService.js";
import { extractJobLinks } from "./extractors/extractJobLinks.js";
import { jobKeywords } from "./helpers/jobKeywords.js";
import { extractJobLinksForAlchemy } from "./extractors/extractJobLinksForAlchemy.js";
import { extractJobLinksForCodeArt } from "./extractors/extractJobLinksForCodeart.js";
import { extractJobLinksForDailyDev } from "./extractors/extractJobLinksForDailyDev.js";
import { extractJobLinksForPercs } from "./extractors/extractJobLinksForPercs.js";
import { extractJobLinksForDealFront } from "./extractors/extractJobLinksForDealfront.js";
import { extractJobLinksForSputnik } from "./extractors/extractJobLinksForSputnik.js";
import { extractJobLinksForStack } from "./extractors/extractJobLinksForStack.js";
import { extractJobLinksForModeMobile } from "./extractors/extractJobLinksForModeMobile.js";
import { extractJobLinksForWorkMotion } from "./extractors/extractJobLinksForWorkMotion.js";
import { extractJobLinksForOnTheGo } from "./extractors/extractJobLinksForOnTheGo.js";
import { extractJobLinksForRevenueAI } from "./extractors/extractJobLinksForRevenueAI.js";

const scrapeCompany = async (browser, company, visitedJobLinks) => {
  const { companyName, careersLink } = company;
  console.log(`Processing ${companyName} at ${careersLink}`);
  const page = await browser.newPage();

  try {
    await page.goto(careersLink, { waitUntil: "domcontentloaded" });
    await sleep(15000); // Initial wait time for page load

    let jobLinks = await extractJobLinks(page);

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

            // Check for matching keywords in both the element's text and its children's text
            const matched =
              /(open positions|all jobs|job openings|career opportunities|available positions|current openings|see jobs|open roles|see our open positions|view open roles|see all openings|view openings|see open positions|browse all open positions|join our team)/i.test(
                textToCheck.replace(/&nbsp;/g, " ")
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
        await page.goto(viewPositionsHref, { waitUntil: "domcontentloaded" });
        jobLinks = await extractJobLinks(page);
      }
    }

    // Check for Alchemy specifically
    if (careersLink.includes("alchemy.cloud")) {
      const alchemyLinks = await extractJobLinksForAlchemy(page, jobKeywords);
      jobLinks = [...jobLinks, ...alchemyLinks]; // Combine job links
    }

    // Check for DailyDev specifically
    if (careersLink.includes("daily.dev")) {
      const dailyDevLinks = await extractJobLinksForDailyDev(page, jobKeywords);
      jobLinks = [...jobLinks, ...dailyDevLinks]; // Combine job links
    }

    // Check for Percs specifically
    if (careersLink.includes("percs.app")) {
      const percsLinks = await extractJobLinksForPercs(page, jobKeywords);
      jobLinks = [...jobLinks, ...percsLinks]; // Combine job links
    }

    // Check for CodeArt specifically
    if (careersLink.includes("codeart.mk")) {
      const codeArtLinks = await extractJobLinksForCodeArt(page, jobKeywords);
      jobLinks = [...jobLinks, ...codeArtLinks]; // Combine job links
    }

    // Check for Dealfront specifically
    if (careersLink.includes("dealfront.com")) {
      const dealFrontLinks = await extractJobLinksForDealFront(
        page,
        jobKeywords
      );
      jobLinks = [...jobLinks, ...dealFrontLinks]; // Combine job links
    }

    // Check for Sputnik specifically
    if (careersLink.includes("sputnik.digital")) {
      const sputnikLinks = await extractJobLinksForSputnik(page, jobKeywords);
      jobLinks = [...jobLinks, ...sputnikLinks]; // Combine job links
    }

    // Check for Sputnik specifically
    if (careersLink.includes("stackbuilders.com")) {
      const stackLinks = await extractJobLinksForStack(page, jobKeywords);
      jobLinks = [...jobLinks, ...stackLinks]; // Combine job links
    }

    // Check for Mode Mobile specifically
    if (careersLink.includes("modemobile.com")) {
      const modeMobileLinks = await extractJobLinksForModeMobile(
        page,
        jobKeywords
      );
      jobLinks = [...jobLinks, ...modeMobileLinks]; // Combine job links
    }

    // Check for WorkMotion specifically
    if (careersLink.includes("apply.workable.com/workmotion")) {
      const workMotionLinks = await extractJobLinksForWorkMotion(
        page,
        jobKeywords
      );
      jobLinks = [...jobLinks, ...workMotionLinks]; // Combine job links
    }

    // Check for On The Go Systems specifically
    if (careersLink.includes("onthegosystems.com")) {
      const onTheGoLinks = await extractJobLinksForOnTheGo(
        page,
        jobKeywords
      );
      jobLinks = [...jobLinks, ...onTheGoLinks]; // Combine job links
    }

    // Check for RevenueAI specifically
    if (careersLink.includes("revenue.ai")) {
      const revenueLinks = await extractJobLinksForRevenueAI(
        page,
        jobKeywords
      );
      jobLinks = [...jobLinks, ...revenueLinks]; // Combine job links
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
    const companies = await fetchCompanies(
      "http://localhost:8000/api/v1/careers/get"
    );
    const browser = await puppeteer.launch();
    const visitedJobLinks = new Set();

    for (const company of companies) {
      await scrapeCompany(browser, company, visitedJobLinks);
    }

    await browser.close();
  } catch (error) {
    console.error("Error:", error);
  }
};
