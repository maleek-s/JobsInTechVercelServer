export const extractJobLinksForCodeArt = async (page, jobKeywords) => {
  return page.evaluate((jobKeywords) => {
    // Select all job elements within the div containing the job info
    const jobElements = document.querySelectorAll(".info-box");

    return Array.from(jobElements)
      .map((jobElement) => {
        // Extract the job title from the h3 tag with class 'info-box__title'
        const title = jobElement.querySelector(".info-box__title")?.innerText.trim();

        // Extract the job link from the anchor tag with class 'info-box__btn'
        const relativeLink = jobElement.querySelector("a.info-box__btn")?.href;

        // Convert relative link to absolute URL
        const jobLink = relativeLink
          ? new URL(relativeLink, window.location.origin).href
          : null;

        // Check for keywords in the job title
        const matchedKeyword = jobKeywords.find((keyword) =>
          title?.toLowerCase().includes(keyword.toLowerCase())
        );

        // Return job link and matched keyword if a match is found
        return matchedKeyword ? { href: jobLink, keyword: matchedKeyword } : null;
      })
      .filter(Boolean); // Filter out null values
  }, jobKeywords);
};
