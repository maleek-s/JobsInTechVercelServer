export const extractJobLinksForSputnik = async (page, jobKeywords) => {
    return page.evaluate((jobKeywords) => {
      // Select all job elements within the <article> tag
      const jobElements = document.querySelectorAll("article.styles_careers-item__S0jF2");
  
      return Array.from(jobElements)
        .map((jobElement) => {
          // Extract the job title from the <h2> tag
          const title = jobElement.querySelector("h2")?.innerText.trim();
  
          // Extract the relative job link from the anchor tag <a>
          const relativeLink = jobElement.querySelector("a")?.href;
  
          // Convert relative link to absolute URL
          const jobLink = relativeLink
            ? new URL(relativeLink, window.location.origin).href
            : null;
  
          // Check for keywords in the job title
          const matchedKeyword = jobKeywords.find((keyword) =>
            title?.toLowerCase().includes(keyword.toLowerCase())
          );
  
          // Only return the jobLink and keyword if a keyword matches
          return matchedKeyword
            ? { href: jobLink, keyword: matchedKeyword }
            : null;
        })
        .filter(Boolean); // Filter out nulls
    }, jobKeywords);
  };
  