import React from 'react';
import { Calendar, Search, CheckCircle, XCircle } from 'lucide-react';

const Bookings: React.FC = () => {
    const bookings = [
        { id: 1, name: '王小明', service: '按摩理療', date: '2025-03-20', time: '14:30', status: '待確認' },
        { id: 2, name: '李華', service: '臉部精華', date: '2025-03-21', time: '10:00', status: '已完成' },
        { id: 3, name: '張三', service: '全身護理', date: '2025-03-21', time: '16:00', status: '已取消' },
    ];

    return (
        <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>預約管理</h1>

            <div className="admin-card">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input type="text" placeholder="尋找特定的預約日期 / 會員姓名..." style={{ width: '100%', paddingLeft: '2.75rem', color: '#1e293b', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                    </div>
                    <button style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={18} /> 搜尋
                    </button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>會員姓名</th>
                            <th>服務項目</th>
                            <th>日期</th>
                            <th>時間</th>
                            <th>狀態</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(booking => (
                            <tr key={booking.id}>
                                <td style={{ fontWeight: 500 }}>{booking.name}</td>
                                <td>{booking.service}</td>
                                <td style={{ color: '#64748b' }}>{booking.date}</td>
                                <td>{booking.time}</td>
                                <td>
                                    <span style={{
                                        padding: '0.25rem 0.625rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: booking.status === '已完成' ? '#f0f9ff' : booking.status === '待確認' ? '#fef3c7' : '#fee2e2',
                                        color: booking.status === '已完成' ? '#0369a1' : booking.status === '待確認' ? '#92400e' : '#ef4444'
                                    }}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button style={{ padding: '0.375rem', border: 'none', background: '#ecfdf5', color: '#059669', borderRadius: '0.25rem' }}><CheckCircle size={16} /></button>
                                    <button style={{ padding: '0.375rem', border: 'none', background: '#fff1f2', color: '#e11d48', borderRadius: '0.25rem' }}><XCircle size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Bookings;
