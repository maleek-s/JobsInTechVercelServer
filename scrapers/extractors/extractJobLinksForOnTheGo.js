export const extractJobLinksForOnTheGo = async (page, jobKeywords) => {
    return page.evaluate((jobKeywords) => {
      // Select all job elements, looking for the class that wraps job info
      const jobElements = document.querySelectorAll(".tb-grid-column");
  
      return Array.from(jobElements)
        .map((jobElement) => {
          // Extract the job title from the h3 tag containing the job title link
          const title = jobElement.querySelector("h3.tb-heading a")?.innerText.trim();
  
          // Extract the job link from the 'href' attribute of the anchor tag inside h3
          const relativeLink = jobElement.querySelector("h3.tb-heading a")?.href;
  
          // Convert the relative link to absolute URL
          const jobLink = relativeLink
            ? new URL(relativeLink, window.location.origin).href
            : null;
  
          // Check if any of the job title keywords match
          const matchedKeyword = jobKeywords.find((keyword) =>
            title?.toLowerCase().includes(keyword.toLowerCase())
          );
  
          // Return the job link and matched keyword only if a match is found
          return matchedKeyword ? { href: jobLink, keyword: matchedKeyword } : null;
        })
        .filter(Boolean); // Filter out null values
    }, jobKeywords);
  };
  