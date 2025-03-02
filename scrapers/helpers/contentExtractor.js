export const extractContent = async (page, href) => {
  // Try to find the anchor element that matches the href
  let linkHandle = await page.$(
    `a[href^="${new URL(href).origin}"][href*="${new URL(href).pathname}"]`
  );

  if (!linkHandle) {
    return null;
  }

  // Extract the text content directly from the anchor element or its children
  const content = await page.evaluate((link) => {
    // Attempt to get the text directly from the anchor element
    let text = link.innerText?.trim() || "";

    // If no direct innerText, gather text from all child elements
    if (!text) {
      const childTexts = Array.from(link.querySelectorAll("*"))
        .map((child) => child.innerText?.trim())
        .filter(Boolean); // Remove empty strings
      text = childTexts.join(" "); // Join all child text together
    }

    // Check if content is longer than 150 characters
    if (text.length > 150) {
      const firstChildText = link.querySelector("*")?.innerText?.trim();
      text = firstChildText || ""; // Only save the content of the first child element
    }

    return text;
  }, linkHandle);

  return content;
};
