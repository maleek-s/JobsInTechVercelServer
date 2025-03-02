export const extractJobLinksForDailyDev = async (page, jobKeywords) => {
    return page.evaluate((jobKeywords) => {
      const jobElements = document.querySelectorAll(".role-item.accordion");
  
      return Array.from(jobElements)
        .map((jobElement) => {
          const title = jobElement
            .querySelector(".role-title strong")
            ?.innerText.trim();
          const relativeLink = jobElement.querySelector(".apply-button")?.href;
  
          // Convert relative link to absolute URL
          const jobLink = relativeLink ? new URL(relativeLink).href : null;
  
          // Check for keywords in the title
          const matchedKeyword = jobKeywords.find((keyword) =>
            title?.toLowerCase().includes(keyword.toLowerCase())
          );
  
          return matchedKeyword
            ? { href: jobLink, keyword: matchedKeyword }
            : null;
        })
        .filter(Boolean); // Filter out nulls
    }, jobKeywords);
  };