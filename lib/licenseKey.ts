export function generateLicenseKey() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segments = 4;
    const segmentLength = 4;
    
    const generateSegment = () => {
      let segment = "";
      for (let i = 0; i < segmentLength; i++) {
        segment += chars[Math.floor(Math.random() * chars.length)];
      }
      return segment;
    };
  
    const licenseSegments = Array(segments).fill(null).map(generateSegment);
    return licenseSegments.join("-");
  }