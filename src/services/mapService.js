/**
 * Map & Location Connector Service for Coffee Bean Roastery
 * 
 * Architecture:
 * - Ready for Google Maps / Places API credentials (VITE_GOOGLE_MAPS_API_KEY)
 * - Automatic graceful fallback to OpenStreetMap Nominatim + Instant Indian Localities database
 * - Supports Street Name / Locality autocomplete with structured parsing (Street, City, State, Pincode)
 * - GPS 1-Click "Use My Current Location" auto-fill with reverse geocoding
 */

// Google Maps API Key can be placed in .env as VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_API_KEY = (import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) || '';

let isGoogleScriptLoading = false;
let isGoogleScriptLoaded = false;

/**
 * Check connector configuration status
 */
export const getMapConnectorStatus = () => {
  return {
    isGoogleConfigured: Boolean(GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.trim().length > 5),
    activeProvider: (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.trim().length > 5) 
      ? 'Google Places API' 
      : 'OpenStreetMap Geocoder & Instant Directory (Connector Ready)',
    keyHint: GOOGLE_MAPS_API_KEY ? 'Active (Key Configured)' : 'Drop VITE_GOOGLE_MAPS_API_KEY in Front/.env anytime'
  };
};

/**
 * Dynamically load Google Maps JavaScript API with Places library when key is provided
 */
export const loadGoogleMapsSdk = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
  if (window.google && window.google.maps && window.google.maps.places) {
    return Promise.resolve(window.google.maps);
  }
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error('No Google Maps API Key configured'));
  }
  if (isGoogleScriptLoaded) {
    return Promise.resolve(window.google.maps);
  }
  if (isGoogleScriptLoading) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkInterval);
          resolve(window.google.maps);
        }
      }, 100);
    });
  }

  isGoogleScriptLoading = true;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isGoogleScriptLoaded = true;
      isGoogleScriptLoading = false;
      resolve(window.google.maps);
    };
    script.onerror = (err) => {
      isGoogleScriptLoading = false;
      reject(err);
    };
    document.head.appendChild(script);
  });
};

/**
 * Curated list of popular Indian tech, business & residential localities for instant zero-latency suggestions
 */
const POPULAR_LOCALITIES = [
  // Bengaluru
  { street_locality: '100 Feet Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038' },
  { street_locality: '80 Feet Road, 4th Block, Koramangala', city: 'Bengaluru', state: 'Karnataka', pincode: '560034' },
  { street_locality: '27th Main Rd, Sector 1, HSR Layout', city: 'Bengaluru', state: 'Karnataka', pincode: '560102' },
  { street_locality: 'ITPL Main Road, Whitefield', city: 'Bengaluru', state: 'Karnataka', pincode: '560066' },
  { street_locality: 'Outer Ring Road, Bellandur', city: 'Bengaluru', state: 'Karnataka', pincode: '560103' },
  { street_locality: 'Lavelle Road, Shanthala Nagar, Ashok Nagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
  { street_locality: 'Church Street, Shanthala Nagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
  { street_locality: 'Brigade Road, Civil Station', city: 'Bengaluru', state: 'Karnataka', pincode: '560025' },
  { street_locality: '14th Main, 7th Sector, HSR Layout', city: 'Bengaluru', state: 'Karnataka', pincode: '560102' },
  { street_locality: '12th Main Rd, HAL 2nd Stage, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560008' },
  { street_locality: 'Sarjapur Main Road, Doddakannelli', city: 'Bengaluru', state: 'Karnataka', pincode: '560035' },
  { street_locality: 'Bannerghatta Main Road, Bilekahalli', city: 'Bengaluru', state: 'Karnataka', pincode: '560076' },
  { street_locality: '10th Main, 4th Block, Jayanagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560011' },

  // Mumbai
  { street_locality: 'Linking Road, Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
  { street_locality: 'Hill Road, Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
  { street_locality: 'Hiranandani Gardens, Powai', city: 'Mumbai', state: 'Maharashtra', pincode: '400076' },
  { street_locality: 'Juhu Tara Road, Juhu', city: 'Mumbai', state: 'Maharashtra', pincode: '400049' },
  { street_locality: 'Colaba Causeway, Apollo Bandar', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { street_locality: 'Andheri Kurla Road, Chakala, Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400093' },
  { street_locality: 'Lokhandwala Complex, Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400053' },
  { street_locality: 'BKC, Bandra Kurla Complex, Bandra East', city: 'Mumbai', state: 'Maharashtra', pincode: '400051' },
  { street_locality: 'Lower Parel, Senapati Bapat Marg', city: 'Mumbai', state: 'Maharashtra', pincode: '400013' },

  // Delhi NCR
  { street_locality: 'Connaught Place, Inner Circle', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
  { street_locality: 'Hauz Khas Village, Deer Park', city: 'New Delhi', state: 'Delhi', pincode: '110016' },
  { street_locality: 'Greater Kailash 1, M Block Market', city: 'New Delhi', state: 'Delhi', pincode: '110048' },
  { street_locality: 'Greater Kailash 2, M Block Market', city: 'New Delhi', state: 'Delhi', pincode: '110048' },
  { street_locality: 'Defence Colony Main Market', city: 'New Delhi', state: 'Delhi', pincode: '110024' },
  { street_locality: 'Vasant Vihar, Basant Lok Community Centre', city: 'New Delhi', state: 'Delhi', pincode: '110057' },
  { street_locality: 'Cyber Hub, DLF Phase 2, Sector 24', city: 'Gurugram', state: 'Haryana', pincode: '122002' },
  { street_locality: 'Golf Course Road, Sector 54', city: 'Gurugram', state: 'Haryana', pincode: '122002' },
  { street_locality: 'Sector 18 Market, Atta Market', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },

  // Hyderabad
  { street_locality: 'HITEC City, Madhapur', city: 'Hyderabad', state: 'Telangana', pincode: '500081' },
  { street_locality: 'Road No. 36, Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033' },
  { street_locality: 'Road No. 1, Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034' },
  { street_locality: 'Financial District, Nanakramguda', city: 'Hyderabad', state: 'Telangana', pincode: '500032' },
  { street_locality: 'Gachibowli Main Road', city: 'Hyderabad', state: 'Telangana', pincode: '500032' },

  // Chennai
  { street_locality: 'Khader Nawaz Khan Road, Nungambakkam', city: 'Chennai', state: 'Tamil Nadu', pincode: '600006' },
  { street_locality: '2nd Avenue, Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040' },
  { street_locality: 'Pondy Bazaar, T. Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017' },
  { street_locality: 'Gandhi Nagar, Adyar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600020' },
  { street_locality: 'OMR Road, Thoraipakkam', city: 'Chennai', state: 'Tamil Nadu', pincode: '600097' },

  // Pune
  { street_locality: 'North Main Road, Koregaon Park', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  { street_locality: 'FC Road (Fergusson College Rd), Shivajinagar', city: 'Pune', state: 'Maharashtra', pincode: '411004' },
  { street_locality: 'Baner Road, Balewadi High Street', city: 'Pune', state: 'Maharashtra', pincode: '411045' },
  { street_locality: 'Viman Nagar Main Road', city: 'Pune', state: 'Maharashtra', pincode: '411014' },

  // Kolkata
  { street_locality: 'Park Street, Mullick Bazar', city: 'Kolkata', state: 'West Bengal', pincode: '700016' },
  { street_locality: 'Salt Lake City, Sector V', city: 'Kolkata', state: 'West Bengal', pincode: '700091' },
  { street_locality: 'Ballygunge Circular Road', city: 'Kolkata', state: 'West Bengal', pincode: '700019' }
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry', 'Jammu and Kashmir', 'Ladakh'
];

/**
 * Search street name / locality options
 * @param {string} query Search input string
 * @returns {Promise<Array<{ street_locality: string, city: string, state: string, pincode: string, description: string }>>}
 */
export const searchAddressOptions = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }
  const cleanQuery = query.trim().toLowerCase();

  // 1. If Google Maps SDK is loaded with credentials, use Google Places Autocomplete
  if (GOOGLE_MAPS_API_KEY && window.google?.maps?.places?.AutocompleteService) {
    try {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      const predictions = await new Promise((resolve, reject) => {
        autocompleteService.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: 'in' },
            types: ['geocode', 'establishment']
          },
          (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              resolve([]);
            }
          }
        );
      });

      if (predictions && predictions.length > 0) {
        return predictions.slice(0, 6).map((pred) => {
          const mainText = pred.structured_formatting?.main_text || pred.description.split(',')[0];
          const secondaryText = pred.structured_formatting?.secondary_text || '';
          
          // Parse pieces from secondary text
          const parts = secondaryText.split(',').map((p) => p.trim());
          const stateCandidate = INDIAN_STATES.find((s) => secondaryText.toLowerCase().includes(s.toLowerCase())) || '';
          const cityCandidate = parts[0] || '';

          return {
            street_locality: mainText,
            city: cityCandidate,
            state: stateCandidate,
            pincode: '',
            description: pred.description,
            source: 'Google Places'
          };
        });
      }
    } catch (googleErr) {
      console.warn('Google Places Autocomplete failed, falling back to open provider:', googleErr);
    }
  }

  // 2. Connector Fallback A: Live OpenStreetMap Nominatim Geocoder API (Zero-config, free)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for speed

    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=in&limit=6&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CoffeeBeanRoastery/1.0'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => {
          const addr = item.address || {};
          const street = addr.road || addr.suburb || addr.neighbourhood || addr.residential || item.display_name.split(',')[0];
          const city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || '';
          const state = addr.state || '';
          const pincode = addr.postcode || '';

          return {
            street_locality: street,
            city: city,
            state: state,
            pincode: pincode,
            description: item.display_name,
            source: 'OpenStreetMap'
          };
        });
      }
    }
  } catch (err) {
    // Timeout or network error - gracefully proceed to instant curated directory
  }

  // 3. Connector Fallback B: Instant Curated Local Directory (Always available, 0ms latency)
  const matched = POPULAR_LOCALITIES.filter((item) => {
    return (
      item.street_locality.toLowerCase().includes(cleanQuery) ||
      item.city.toLowerCase().includes(cleanQuery) ||
      item.state.toLowerCase().includes(cleanQuery) ||
      item.pincode.includes(cleanQuery)
    );
  });

  return matched.slice(0, 5).map((item) => ({
    ...item,
    description: `${item.street_locality}, ${item.city}, ${item.state} - ${item.pincode}`,
    source: 'Quick Directory'
  }));
};

/**
 * 1-Click GPS "Use My Current Location" Auto-fill
 * Retrieves browser coordinates and reverse-geocodes into structured fields
 * @returns {Promise<{ house_flat: string, street_locality: string, city: string, state: string, pincode: string, description: string }>}
 */
export const getCurrentLocationAddress = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser'));
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // If Google Maps Geocoder is available and key set
        if (GOOGLE_MAPS_API_KEY && window.google?.maps?.Geocoder) {
          try {
            const geocoder = new window.google.maps.Geocoder();
            const results = await new Promise((resG, rejG) => {
              geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                if (status === 'OK' && results && results.length > 0) resG(results);
                else rejG(new Error('Google Geocoder failed'));
              });
            });

            if (results && results[0]) {
              const best = results[0];
              let street_locality = '';
              let city = '';
              let state = '';
              let pincode = '';
              let house_flat = '';

              best.address_components.forEach((c) => {
                if (c.types.includes('street_number')) house_flat = c.long_name;
                if (c.types.includes('route') || c.types.includes('sublocality')) {
                  street_locality = street_locality ? `${street_locality}, ${c.long_name}` : c.long_name;
                }
                if (c.types.includes('locality')) city = c.long_name;
                if (c.types.includes('administrative_area_level_1')) state = c.long_name;
                if (c.types.includes('postal_code')) pincode = c.long_name;
              });

              return resolve({
                house_flat,
                street_locality: street_locality || best.formatted_address.split(',')[0],
                city,
                state,
                pincode,
                description: best.formatted_address,
                source: 'Google GPS'
              });
            }
          } catch (gErr) {
            console.warn('Google reverse geocode fallback to Nominatim:', gErr);
          }
        }

        // OpenStreetMap Reverse Geocoder Fallback
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'CoffeeBeanRoastery/1.0' }
          });
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};

            const house_flat = addr.house_number || addr.building || '';
            const street_locality = addr.road || addr.suburb || addr.neighbourhood || addr.quarter || '';
            const city = addr.city || addr.town || addr.municipality || addr.county || addr.city_district || '';
            const state = addr.state || '';
            const pincode = addr.postcode || '';

            return resolve({
              house_flat,
              street_locality: street_locality || (data.display_name ? data.display_name.split(',')[0] : ''),
              city,
              state,
              pincode,
              description: data.display_name || 'Detected Location',
              source: 'GPS Reverse-Geocode'
            });
          }
        } catch (fetchErr) {
          console.error('Reverse geocode error:', fetchErr);
        }

        // Last fallback: Return coordinates with hint
        resolve({
          house_flat: '',
          street_locality: `GPS Pin (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          city: '',
          state: '',
          pincode: '',
          description: `Location detected at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          source: 'GPS Raw'
        });
      },
      (err) => {
        let errorMsg = 'Could not access your location. Please check browser permissions.';
        if (err.code === 1) errorMsg = 'Location permission denied. Please allow location access in your browser settings.';
        if (err.code === 2) errorMsg = 'Location position unavailable. Please type your locality below.';
        if (err.code === 3) errorMsg = 'Location request timed out.';
        reject(new Error(errorMsg));
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
};
