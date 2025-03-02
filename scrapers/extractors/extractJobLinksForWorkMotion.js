export const extractJobLinksForWorkMotion = async (page, jobKeywords) => {
  return page.evaluate((jobKeywords) => {
    // Select all the <li> elements with the class "styles--1vo9F"
    const jobElements = document.querySelectorAll('li.styles--1vo9F[data-ui="job"]');

    return Array.from(jobElements)
      .map((jobElement) => {
        // Extract the job title
        const title = jobElement.querySelector('h3[data-ui="job-title"] span')?.innerText.trim();

        // Extract the relative job link from the <a> tag
        const relativeLink = jobElement.querySelector('a')?.href;

        // Convert the relative link to an absolute URL
        const jobLink = relativeLink
          ? new URL(relativeLink, window.location.origin).href
          : null;

        // Match the job title with the provided keywords
        const matchedKeyword = jobKeywords.find((keyword) =>
          title?.toLowerCase().includes(keyword.toLowerCase())
        );

        // Return only the job link and matched keyword if a match is found
        return matchedKeyword ? { href: jobLink, keyword: matchedKeyword } : null;
      })
      .filter(Boolean); // Filter out null results
  }, jobKeywords);
};
