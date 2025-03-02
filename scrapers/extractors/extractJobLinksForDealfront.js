export const extractJobLinksForDealFront = async (page, jobKeywords) => {
    return page.evaluate((jobKeywords) => {
      // Select all job offer elements
      const jobElements = document.querySelectorAll(".style-module--job-offer--d6588");
  
      return Array.from(jobElements)
        .map((jobElement) => {
          // Extract the job title from the h6 tag
          const title = jobElement
            .querySelector(".style-module--job-offer__name--31767 h6")
            ?.innerText.trim();
  
          // Extract the job link from the anchor tag
          const relativeLink = jobElement
            .querySelector(".style-module--job-offer__link--576fe a")
            ?.href;
  
          // Convert relative link to absolute URL
          const jobLink = relativeLink
            ? new URL(relativeLink, window.location.origin).href
            : null;
  
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