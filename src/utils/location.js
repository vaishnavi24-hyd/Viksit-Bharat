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

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location access denied. Please enable GPS."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error("Failed to fetch address");
          const data = await res.json();
          resolve({
            latitude,
            longitude,
            address: data.display_name || "Address not found"
          });
        } catch (err) {
          console.error("Reverse Geocoding failed", err);
          resolve({
            latitude,
            longitude,
            address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
          });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        reject(new Error("Location access denied. Please enable GPS."));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};
