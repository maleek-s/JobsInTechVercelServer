import puppeteer from "puppeteer";

export async function jobContentScraper(jobUrl) {
    let browser;
    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(jobUrl, { waitUntil: "load", timeout: 0 });

        const jobPostContent = await page.evaluate(() => {
            const MAX_CHAR_COUNT = 300;
            const MIN_CHAR_COUNT = 20;

            function getFirstHeadingUpwards(element) {
                let currentElement = element;
                while (currentElement) {
                    const previousSibling = currentElement.previousElementSibling;
                    if (previousSibling) {
                        if (
                            previousSibling.tagName.toLowerCase().startsWith("h") ||
                            (previousSibling.tagName.toLowerCase() === "p" &&
                                previousSibling.querySelector("strong, em"))
                        ) {
                            const text = previousSibling.innerText.trim();
                            if (text.length > 0 && text.length <= MAX_CHAR_COUNT) {
                                return text;
                            }
                        }
                    }
                    currentElement = previousSibling ? previousSibling : currentElement.parentElement;
                }
                return null;
            }            

            const content = {};
            const seenTexts = new Set(); // Track already added texts to avoid duplicates

            // Select all elements inside <ul> including <li>, <div>, <span>
            document.querySelectorAll("ul li, ul div, ul span, ul li *").forEach((element) => {
                const elementText = element.innerText.trim();

                // Skip elements with no text, excessive text length, anchor tags, or duplicates
                if (!elementText || elementText.length > MAX_CHAR_COUNT || elementText.length < MIN_CHAR_COUNT || element.querySelector("a") || seenTexts.has(elementText)) {
                    return;
                }

                const heading = getFirstHeadingUpwards(element) || "More info";
                if (heading) {
                    if (!content[heading]) {
                        content[heading] = [];
                    }
                    content[heading].push(elementText);
                    seenTexts.add(elementText); // Mark text as seen to prevent duplicates
                }
            });

            return Object.keys(content).map((heading) => ({
                [heading]: content[heading],
            }));
        });

        return jobPostContent;
    } catch (error) {
        console.error("Error scraping job post:", error);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
