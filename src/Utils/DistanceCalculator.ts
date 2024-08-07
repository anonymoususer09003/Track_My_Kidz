function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371; // Radius of the earth in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Convert to meters
  return earthRadius * c * 1000;
}

function toRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

export { calculateDistance };
// Usage
const lat1 = 40.7128;
const lon1 = -74.006;
const lat2 = 40.7129;
const lon2 = -74.006;

const distance = calculateDistance(lat1, lon1, lat2, lon2);
const isUnder100Meters = distance < 100;
