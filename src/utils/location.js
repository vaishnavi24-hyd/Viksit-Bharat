export const getLocation = () => {
  return new Promise((resolve) => {
    const DEFAULT_LOCATION = { lat: 17.3850, lng: 78.4867 };

    const getStoredOrFallback = () => {
      try {
        const stored = localStorage.getItem("last_location");
        if (stored) {
          const parsed = JSON.parse(stored);
          resolve({ lat: parsed.lat, lng: parsed.lng, _source: 'storage' });
        } else {
          resolve({ ...DEFAULT_LOCATION, _source: 'default' });
        }
      } catch (e) {
        resolve({ ...DEFAULT_LOCATION, _source: 'default' });
      }
    };

    if (!navigator.geolocation) {
      getStoredOrFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        try {
          localStorage.setItem("last_location", JSON.stringify(loc));
        } catch(e) {}
        resolve({ ...loc, _source: 'gps' });
      },
      (error) => {
        getStoredOrFallback();
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
};
