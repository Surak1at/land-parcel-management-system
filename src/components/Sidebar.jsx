const Sidebar = ({ parcels, onFlyTo, onDelete}) => {
    return (
        <div className="sidebar" style={{ width: '350px', overflowY: 'auto', padding: '15px', borderRight: '1px solid #ddd' }}>
            <h2>รายการแปลงที่ดิน ({parcels.length})</h2>
            <hr />
            {parcels.length === 0 && <p>ยังไม่มีข้อมูล จิ้มบนแผนที่เพื่อเริ่ม</p>}
            {parcels.map((parcel) => (
                <div key={parcel.id} className="parcel-card" style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '8px', background: '#fff' }}>
                    {parcel.image && <img src={parcel.image} alt={parcel.name} style={{ width: '100%', borderRadius: '4px' }} />}
                    <h3 style={{ margin: '10px 0 5px' }}>{parcel.name}</h3>
                    <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>{parcel.details}</p>
                    <p><strong>พื้นที่:</strong> {parcel.area} ตร.ม.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                        <button onClick={() => onFlyTo(parcel.center)} className="btn-view">
                            🔍 ดูบนแผนที่
                        </button>
                        <button onClick={() => onDelete(parcel.id)} className="btn-delete-full">
                            🗑️ ลบข้อมูลแปลงนี้
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Sidebar;