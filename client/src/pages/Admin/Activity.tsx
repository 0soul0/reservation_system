import React from 'react';
import { ToggleRight, Image, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Activity: React.FC = () => {
    const navigate = useNavigate();
    const activities = [
        { id: 1, name: '春季養生月', date: '2025/03/01 - 2025/03/31', status: '進行中' },
        { id: 2, name: '新用戶首單半價', date: '永久有效', status: '已發布' },
    ];

    return (
        <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>活動設定</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                <div
                    onClick={() => navigate('/admin/activity/new')}
                    className="admin-card"
                    style={{ border: '2px dashed #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', color: '#64748b', cursor: 'pointer' }}
                >
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}><Image size={32} /></div>
                    <p style={{ fontWeight: 600 }}>創建新活動</p>
                </div>

                {activities.map(activity => (
                    <div key={activity.id} className="admin-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>{activity.status}</span>
                            <ToggleRight color="var(--primary)" size={18} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{activity.name}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>有效期限：{activity.date}</p>
                        <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                            <button
                                onClick={() => navigate(`/admin/activity/${activity.id}`)}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                            >
                                <Edit2 size={16} /> 編輯
                            </button>
                            <button style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: '0.5rem', borderRadius: '0.375rem' }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Activity;
