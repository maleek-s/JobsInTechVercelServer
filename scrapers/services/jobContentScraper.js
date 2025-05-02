import puppeteer from "puppeteer";

export async function jobContentScraper(jobUrl) {
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(jobUrl, { waitUntil: "load", timeout: 30000 });

    const BLACKLIST_SELECTORS = [
      '[id*="cookie"]',
      '[class*="cookie"]',
      '[id*="consent"]',
      '[class*="consent"]',
      '[id*="privacy"]',
      '[class*="privacy"]',
      '[class*="intercom"]',
      '[id*="intercom"]',
      '[id*="ads"]',
      '[class*="ads"]',
      "iframe",
      "script",
      "noscript",
      "footer",
      "#footer",
      '[role="complementary"]',
    ];

    await page.evaluate((selectors) => {
      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => el.remove());
      });
    }, BLACKLIST_SELECTORS);

    const jobPostContent = await page.evaluate(() => {
      const MAX_CHAR_COUNT = 300;
      const MIN_CHAR_COUNT = 20;

      function getFirstHeadingUpwards(element) {
        let currentElement = element;
        while (currentElement) {
          // Check previous siblings
          let sibling = currentElement.previousElementSibling;
          while (sibling) {
            const tag = sibling.tagName.toLowerCase();
            if (
              tag.startsWith("h") ||
              (tag === "p" && sibling.querySelector("strong, em, b"))
            ) {
              const text = sibling.innerText.trim();
              if (text && text.length <= MAX_CHAR_COUNT) {
                return text;
              }
            }
            sibling = sibling.previousElementSibling;
          }
          currentElement = currentElement.parentElement;
        }
        return "Job Details";
      }

      const content = {};
      const seenTexts = new Set();

      // Select all potential content elements
      const selectors = [
        "ul li",
        "ol li",
        "div.job-description *",
        "div.description *",
        "section.job-content *",
      ];

      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          const elementText = element.innerText.trim();

          if (
            !elementText ||
            elementText.length > MAX_CHAR_COUNT ||
            elementText.length < MIN_CHAR_COUNT ||
            seenTexts.has(elementText)
          ) {
            return;
          }

          const heading = getFirstHeadingUpwards(element);
          if (!content[heading]) {
            content[heading] = [];
          }

          content[heading].push(elementText);
          seenTexts.add(elementText);
        });
      });

      // Fallback if no content found
      if (Object.keys(content).length === 0) {
        const mainContent = document.querySelector(
          "main, article, .content"
        )?.innerText;
        if (mainContent) {
          return [
            {
              "Job Description": [mainContent.substring(0, 500) + "..."],
            },
          ];
        }
        return [
          {
            "Job Details": ["Please visit the job link for full job details."],
          },
        ];
      }

      return Object.entries(content).map(([heading, items]) => ({
        [heading]: items,
      }));
    });

    return jobPostContent || [{ Error: ["Could not extract job content"] }];
  } catch (error) {
    console.error("Error scraping job post:", error);
    return [{ "Job Details": ["Please visit the job link for full job details."] }];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
