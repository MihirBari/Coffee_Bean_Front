import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Retrieve or generate a persistent unique visitor ID
export const getVisitorId = () => {
  try {
    let visitorId = localStorage.getItem('cb_visitor_id');
    if (!visitorId) {
      visitorId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('cb_visitor_id', visitorId);
    }
    return visitorId;
  } catch (e) {
    return `vis_guest_${Date.now()}`;
  }
};

// Debounce state to prevent duplicate tracks on React fast re-renders
let lastTracked = {
  path: '',
  timestamp: 0,
};

/**
 * Track a page view event
 * @param {string} pagePath - e.g. '/', '/shop', '/admin', '/cart', '/checkout', '/product/1'
 * @param {string} pageTitle - Human-readable label
 */
export const trackPageView = async (pagePath, pageTitle) => {
  try {
    const now = Date.now();
    // Ignore exact duplicate page path within 2.5 seconds
    if (lastTracked.path === pagePath && now - lastTracked.timestamp < 2500) {
      return;
    }
    lastTracked = { path: pagePath, timestamp: now };

    const visitorId = getVisitorId();
    await axios.post(
      `${API_BASE}/analytics/track-view`,
      {
        page_path: pagePath,
        page_title: pageTitle || pagePath,
        visitor_id: visitorId,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      },
      { timeout: 3000 }
    );
  } catch (err) {
    // Analytics failures should never crash or block UI
    console.debug('Analytics page tracking skipped:', err.message);
  }
};

/**
 * Track an interaction with a coffee bean product
 * @param {number|string} productId
 * @param {'view'|'add_to_cart'|'wishlist'} eventType
 */
export const trackProductEvent = async (productId, eventType) => {
  try {
    const visitorId = getVisitorId();
    await axios.post(
      `${API_BASE}/analytics/track-product`,
      {
        product_id: productId,
        event_type: eventType,
        visitor_id: visitorId,
      },
      { timeout: 3000 }
    );
  } catch (err) {
    console.debug('Analytics product tracking skipped:', err.message);
  }
};
