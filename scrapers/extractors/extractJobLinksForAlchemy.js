export const extractJobLinksForAlchemy = async (page, jobKeywords) => {
    return page.evaluate((jobKeywords) => {
      const jobElements = document.querySelectorAll(".collection-item-2");
  
      return Array.from(jobElements)
        .map((jobElement) => {
          const title = jobElement.querySelector(".job-title")?.innerText.trim();
          const relativeLink = jobElement.querySelector("a")?.href;
  
          const jobLink = relativeLink
            ? new URL(relativeLink, window.location.origin).href
            : null;
  
          const matchedKeyword = jobKeywords.find((keyword) =>
            title?.toLowerCase().includes(keyword.toLowerCase())
          );
  
          return matchedKeyword ? { href: jobLink, keyword: matchedKeyword } : null;
        })
        .filter(Boolean);
    }, jobKeywords);
  };
  