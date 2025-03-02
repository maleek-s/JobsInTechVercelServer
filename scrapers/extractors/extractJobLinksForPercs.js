export const extractJobLinksForPercs = async (page, jobKeywords) => {
    return page.evaluate((jobKeywords) => {
      // Select all the list items with class 'links-03__item'
      const jobElements = document.querySelectorAll("li.links-03__item");
  
      return Array.from(jobElements)
        .map((jobElement) => {
          // Extract the job title from the div with class 'links-03__title'
          const title = jobElement
            .querySelector(".links-03__title")
            ?.innerText.trim();
  
          // Extract the job link from the anchor tag with class 'button--accent-bg'
          const relativeLink = jobElement
            .querySelector(".button--accent-bg")
            ?.href;
  
          // Convert relative link to absolute URL
          const jobLink = relativeLink ? new URL(relativeLink, window.location.origin).href : null;
  
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