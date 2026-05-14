import { useState } from 'react';
import './App.css';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import Swal from 'sweetalert2';

function App() {
  const [parcels, setParcels] = useState([]);
  const [flyToTarget, setFlyToTarget] = useState(null);

  const handleAddParcel = (newParcel) => {
    setParcels([...parcels, newParcel]);
    setFlyToTarget(null); // ล้างเป้าหมายเมื่อบันทึกแปลงใหม่เสร็จ เพื่อให้แผนที่อิสระ
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณจะไม่สามารถกู้คืนข้อมูลนี้ได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        setParcels(parcels.filter(p => p.id !== id));
        setFlyToTarget(null);
        Swal.fire('ลบแล้ว!', 'ข้อมูลถูกลบออกจากระบบ', 'success');
      }
    });
  };

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        parcels={parcels}
        onFlyTo={(coords) => setFlyToTarget(coords)}
        onDelete={handleDelete}
      />
      <div className="map-wrapper" style={{ flexGrow: 1, position: 'relative' }}>
        <MapView
          parcels={parcels}
          onAddParcel={handleAddParcel}
          flyToTarget={flyToTarget}
          onClearInspect={() => setFlyToTarget(null)} // ฟังก์ชันล้างโหมดดูแผนที่
        />
      </div>
    </div>
  );
}

export default App;