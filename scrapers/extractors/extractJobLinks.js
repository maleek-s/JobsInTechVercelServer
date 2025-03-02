import { jobKeywords } from "../helpers/jobKeywords.js";

export const extractJobLinks = async (page) => {
  await page.waitForSelector("body");

   // Check for CAPTCHA by looking for a known pattern in the HTML (like iframe or a CAPTCHA-related element)
   const isCaptcha = await page.evaluate(() => {
    return document.querySelector("iframe[src*='captcha']") !== null;
  });

  if (isCaptcha) {
    return [];
  }

  const jobLinks = await page.evaluate((jobKeywords) => {
    const links = Array.from(document.querySelectorAll("a"));

    return links
      .map((link, index) => {
        
        // Get the href and check if it's valid
        const href = link.href ? link.href.trim() : "";
        if (!href || href === "") {
          return null; // Skip links without valid href
        }
        // Get the text to check for job keywords
        let textToCheck = link.innerText.trim().toLowerCase();

        // Fallback logic for extracting text if the anchor tag's text is empty
        if (!textToCheck.trim()) {
          const childTexts = Array.from(link.querySelectorAll("*"))
            .map((el) => el.innerText)
            .join(" ")
            .toLowerCase();
          textToCheck = childTexts;
        }

        if (!textToCheck.trim()) {
          const siblingTexts = Array.from(link.parentNode.children)
            .filter((el) => el !== link) // Exclude the link itself
            .map((sibling) => sibling.innerText)
            .join(" ")
            .toLowerCase();
          textToCheck = siblingTexts;
        }
        // Find matching keyword
        const matchedKeyword = jobKeywords.find((keyword) =>
          textToCheck.includes(
            keyword
              .toLowerCase()
              .replace(/\s*\(.*?\)\s*/g, "")
          )
        );
        // Return the job link if a matching keyword is found
        return matchedKeyword ? { href, keyword: matchedKeyword } : null;
      })
      .filter(Boolean); // Filter out null values
  }, jobKeywords);

  return jobLinks;
};