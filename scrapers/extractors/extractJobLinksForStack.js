export const extractJobLinksForStack = async (page, jobKeywords) => {
  return page.evaluate((jobKeywords) => {
    const jobOpenings = Array.from(document.querySelectorAll("li[data-ui='job-opening']"));
    
    return jobOpenings.map((job) => {
      const link = job.querySelector("a");
      const titleElement = job.querySelector("h3[data-id='job-item']");
      
      if (!link || !titleElement) return null;

      const titleText = titleElement.innerText.toLowerCase();
      const matchedKeyword = jobKeywords.find((keyword) =>
        titleText.includes(keyword.toLowerCase())
      );

      return matchedKeyword
        ? { href: link.href, keyword: matchedKeyword }
        : null;
    }).filter(Boolean);
  }, jobKeywords);
};
