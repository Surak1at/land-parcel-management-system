import * as turf from '@turf/turf';

export const calculateParcelArea = (coords) => {
  if (!coords || coords.length < 3) return 0;
  
  // แปลง [lat, lng] เป็น [lng, lat] สำหรับ Turf.js
  const formattedCoords = coords.map(c => [c[1], c[0]]);
  
  // ปิดลูป Polygon (จุดสุดท้ายต้องเหมือนจุดแรก)
  formattedCoords.push(formattedCoords[0]); 

  const polygon = turf.polygon([formattedCoords]);
  const areaSqMeters = turf.area(polygon);
  
  return areaSqMeters.toFixed(2);
};