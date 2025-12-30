import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import logger from '@/utils/logger';

/**
 * Custom hook to track page views with Firebase Analytics.
 * @param {string} pageTitle - The title of the page to log.
 */
export function usePageTracking(pageTitle) {
  const location = useLocation();

  useEffect(() => {
    // Analytics: Log page view (deferred to not block render)
    import('@/utils/firebase')
      .then(({ initializeFirebase }) => initializeFirebase())
      .then(({ analytics }) => {
        if (analytics) {
          return import('firebase/analytics').then(({ logEvent }) => {
            logEvent(analytics, 'page_view', {
              page_path: location.pathname,
              page_title: pageTitle,
            });
          });
        }
      })
      .catch((err) => logger.error(`Failed to log analytics for ${pageTitle}:`, err));
  }, [location.pathname, pageTitle]);
}
