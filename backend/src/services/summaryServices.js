export const summarizeReadme = (readmeText) => {
  if (!readmeText) {
    return "No README available.";
  }

  const cleanText = readmeText
    .replace(/[#>*`~-]/g, "")
    .replace(/\r/g, "")
    .trim();

  const paragraphs = cleanText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return paragraphs.slice(0, 2).join("\n\n").substring(0, 1000);
};
