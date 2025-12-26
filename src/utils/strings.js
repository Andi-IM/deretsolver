// Helper function untuk unescape string
export const unescapeString = (str) => {
  if (typeof str !== "string") return str;
  
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
};

export const recursiveUnescape = (value) => {
  if (typeof value === "string") {
    return unescapeString(value);
  }
  
  if (Array.isArray(value)) {
    return value.map(recursiveUnescape);
  }
  
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        unescapeString(key), // unescape keys juga
        recursiveUnescape(val),
      ])
    );
  }
  
  return value;
};