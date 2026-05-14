import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap } from 'react-leaflet';
import * as turf from '@turf/turf';
import { calculateParcelArea } from '../utils/areaCalc';
import 'leaflet/dist/leaflet.css';
import Swal from 'sweetalert2';

const FlyToLocation = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, 18, { animate: true });
    }, [center, map]);
    return null;
};

const MapEvents = ({ onAddPoint, isInspectMode }) => {
    useMapEvents({
        click(e) {
            // ถ้าอยู่ในโหมดดูแผนที่ (Inspect) จะไม่ยอมให้วาดจุดใหม่
            if (isInspectMode) return;
            const { lat, lng } = e.latlng;
            onAddPoint([lat, lng]);
        },
    });
    return null;
};

const MapView = ({ parcels, onAddParcel, flyToTarget, onClearInspect }) => {
    const [tempPoints, setTempPoints] = useState([]);

    const handleSave = async () => {
        if (tempPoints.length < 3) return Swal.fire("แจ้งเตือน", "กรุณาวางพิกัดอย่างน้อย 3 จุด", "warning");

        // ใช้ SweetAlert2 สร้างป๊อปอัพฟอร์ม
        const { value: formValues } = await Swal.fire({
            title: 'บันทึกข้อมูลแปลงที่ดิน',
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="ชื่อแปลงที่ดิน">' +
                '<textarea id="swal-input2" class="swal2-textarea" placeholder="รายละเอียดพื้นที่"></textarea>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').value
                ]
            }
        });

        if (formValues && formValues[0]) {
            const [name, details] = formValues;
            const area = calculateParcelArea(tempPoints);

            // 1. คำนวณจุดกึ่งกลาง (Center) เพื่อใช้ทำ FlyTo และ Static Map
            const points = turf.points(tempPoints.map(p => [p[1], p[0]]));
            const centerPoint = turf.center(points);
            const [lon, lat] = centerPoint.geometry.coordinates;

            // 2. สร้าง URL สำหรับ Static Map พร้อมวาดเส้น Polygon (ข้อ 3)
            const pathCoords = tempPoints.map(p => `${p[1]},${p[0]}`).join(',');
            const staticImageUrl = `https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${lon},${lat}&z=17&l=sat&size=450,300&pl=c:0000ffFF,w:3,${pathCoords},${tempPoints[0][1]},${tempPoints[0][0]}`;

            // 3. ประกอบร่างเป็น Object newParcel (ประกาศตัวแปรที่นี่)
            const newParcel = {
                id: Date.now(),
                name: name,
                details: details || "-",
                coordinates: tempPoints,
                area: area,
                center: [lat, lon],
                image: staticImageUrl
            };

            // 4. ส่งไปบันทึกและล้างค่า
            onAddParcel(newParcel);
            setTempPoints([]);

            Swal.fire("สำเร็จ!", "บันทึกข้อมูลเรียบร้อยแล้ว", "success");
        }
    };

    return (
        <div style={{ height: '100%', position: 'relative' }}>
            {/* โหมดวาดปกติ */}
            {!flyToTarget && (
                <div style={{ position: 'absolute', top: 10, left: 50, zIndex: 1000, display: 'flex', gap: '10px' }}>
                    <button onClick={() => setTempPoints([])} className="btn-nav">ล้างจุดวาด</button>
                    <button onClick={handleSave} className="btn-save">
                        บันทึกแปลงที่ดิน ({tempPoints.length} จุด)
                    </button>
                </div>
            )}

            {/* ข้อ 2: โหมดดูแผนที่ (Inspection Mode Overlay) */}
            {flyToTarget && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 999, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span>📍 กำลังแสดงตำแหน่งแปลงที่ดิน</span>
                        <button onClick={onClearInspect} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 15px', borderRadius: '15px', cursor: 'pointer' }}>
                            ออกจากโหมดดูแผนที่
                        </button>
                    </div>
                </div>
            )}

            <MapContainer center={[13.7563, 100.5018]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapEvents onAddPoint={(point) => setTempPoints((prev) => [...prev, point])} isInspectMode={!!flyToTarget} />
                <FlyToLocation center={flyToTarget} />

                {tempPoints.map((p, i) => <Marker key={i} position={p} />)}
                {tempPoints.length > 1 && <Polygon positions={tempPoints} color="orange" />}
                {parcels.map(p => (
                    <Polygon
                        key={p.id}
                        positions={p.coordinates}
                        color={flyToTarget && flyToTarget[0] === p.center[0] ? "red" : "blue"} // ไฮไลท์สีแดงถ้ากำลังดูแปลงนั้นอยู่
                    />
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;