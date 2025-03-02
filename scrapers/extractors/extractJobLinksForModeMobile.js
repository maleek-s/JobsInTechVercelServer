export const extractJobLinksForModeMobile = async (page, jobKeywords) => {
    return page.evaluate((jobKeywords) => {
      // Select all elements with the class "opening" which contains the job links
      const jobElements = document.querySelectorAll(".opening");
  
      return Array.from(jobElements)
        .map((jobElement) => {
          // Extract the job title from the anchor tag within the opening element
          const title = jobElement.querySelector("a")?.innerText.trim();
  
          // Get the href attribute from the anchor tag
          const relativeLink = jobElement.querySelector("a")?.href;
  
          // Convert the relative link to an absolute URL
          const jobLink = relativeLink
            ? new URL(relativeLink, window.location.origin).href
            : null;
  
          // Match the extracted job title with keywords
          const matchedKeyword = jobKeywords.find((keyword) =>
            title?.toLowerCase().includes(keyword.toLowerCase())
          );
  
          // Return the link and the keyword if a match is found
          return matchedKeyword ? { href: jobLink, keyword: matchedKeyword } : null;
        })
        .filter(Boolean); // Filter out null results
    }, jobKeywords);
  };
  