// Wraps navigator.geolocation in a Promise, and NEVER rejects - if
// permission is denied or GPS is unavailable, it resolves to null so
// calling code can gracefully fall back to city-text search instead of
// breaking the whole flow. This matters a lot here since many target
// users are on budget Android phones with flaky GPS or may decline the
// permission prompt without understanding why it's being asked.
export const getCurrentCoords = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lng: pos.coords.longitude, lat: pos.coords.latitude });
      },
      () => resolve(null), // denied, timed out, or unavailable - fail silently
      { timeout: 8000, maximumAge: 60000 }
    );
  });
};
