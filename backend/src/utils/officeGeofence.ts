export const OFFICE_SITE = {
  name: "DLF Corporate Greens",
  address: "Sector 74A, Gurugram",
  latitude: 28.407073,
  longitude: 76.998006,
  radiusMeters: 2000,
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceMeters(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number
) {
  const earthRadius = 6371000;
  const latitudeDelta = toRadians(toLatitude - fromLatitude);
  const longitudeDelta = toRadians(toLongitude - fromLongitude);
  const fromLat = toRadians(fromLatitude);
  const toLat = toRadians(toLatitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLat) *
      Math.cos(toLat) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    earthRadius *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function officeDistanceMeters(
  latitude: number,
  longitude: number
) {
  return distanceMeters(
    latitude,
    longitude,
    OFFICE_SITE.latitude,
    OFFICE_SITE.longitude
  );
}

export function assertInsideOffice(
  latitude: number,
  longitude: number
) {
  const distance = officeDistanceMeters(latitude, longitude);

  if (distance > OFFICE_SITE.radiusMeters) {
    const kilometers = (distance / 1000).toFixed(1);

    throw new Error(
      `Office punch-in is allowed only within 2 km of ${OFFICE_SITE.name}, ${OFFICE_SITE.address}. You are ${kilometers} km away.`
    );
  }

  return distance;
}
