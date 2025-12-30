import { useCallback, useEffect, useState } from 'react';

import logger from '@/utils/logger';

/**
 * Default implementation for loading reCAPTCHA script
 */
export const defaultLoadRecaptchaScript = () => {
  if (window.grecaptcha) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timestamp = Math.floor(Date.now() / 3600000);
    script.src = `https://www.google.com/recaptcha/api.js?render=${
      import.meta.env.VITE_RECAPTCHA_SITE_KEY
    }&t=${timestamp}`;
    script.async = true;
    script.onload = () => {
      if (window.grecaptcha?.ready) window.grecaptcha.ready(resolve);
      else resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

/**
 * Custom hook for managing reCAPTCHA loading and token generation
 * @param {Function} loadRecaptchaScript - Optional custom loader function
 * @returns {Object} { recaptchaReady, getRecaptchaToken }
 */
export function useRecaptcha(loadRecaptchaScript = defaultLoadRecaptchaScript) {
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  // Lazy load reCAPTCHA script
  useEffect(() => {
    let mounted = true;

    loadRecaptchaScript()
      .then(() => {
        if (mounted) {
          setRecaptchaReady(true);
          logger.info('reCAPTCHA loaded successfully');
        }
      })
      .catch((error) => {
        logger.error('Failed to load reCAPTCHA script:', error);
      });

    return () => {
      mounted = false;
    };
  }, [loadRecaptchaScript]);

  const getRecaptchaToken = useCallback(async () => {
    if (!recaptchaReady || !window.grecaptcha) {
      logger.warn('reCAPTCHA not ready, skipping token generation');
      return null;
    }

    try {
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '';
      const token = await window.grecaptcha.execute(siteKey, {
        action: 'submit_feedback',
      });
      return token;
    } catch (error) {
      logger.error('Failed to execute reCAPTCHA:', error);
      return null;
    }
  }, [recaptchaReady]);

  return { recaptchaReady, getRecaptchaToken };
}

export default useRecaptcha;
