export function isValidCoordinates(location: string): boolean {
  if (!location) {
    return false;
  }

  const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
  const match = location.match(coordRegex);

  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[3]);

    // Validate coordinate ranges
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  return false;
}
