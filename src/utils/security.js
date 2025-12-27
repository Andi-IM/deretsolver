import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes a string to prevent XSS attacks.
 * @param {string} dirty - The string to sanitize.
 * @returns {string} - The sanitized string.
 */
export const sanitize = (dirty) => {
  if (typeof dirty !== 'string') return dirty;
  return DOMPurify.sanitize(dirty);
};
