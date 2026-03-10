import React, { useState } from 'react';
import { ChevronLeft, Save, Plus, Trash2, Clock, Mail, Phone, FileText, List } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const ActivityEdit: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // 模擬活動數據
    const [activity, setActivity] = useState({
        name: id === 'new' ? '' : '春季養生月',
        description: '享受專業的理療服務，身心靈的極致放鬆。',
        requireEmail: true,
        requirePhone: true,
        options: [
            { name: '基礎療程', duration: '60 min' },
            { name: '深度進階', duration: '120 min' }
        ],
        selectedOpeningHours: [1] // 關聯 OpeningHours 的 ID
    });

    const addOption = () => {
        setActivity({
            ...activity,
            options: [...activity.options, { name: '', duration: '' }]
        });
    };

    const removeOption = (idx: number) => {
        setActivity({
            ...activity,
            options: activity.options.filter((_, i) => i !== idx)
        });
    };

    const updateOption = (idx: number, field: string, value: string) => {
        const newOptions = [...activity.options];
        (newOptions[idx] as any)[field] = value;
        setActivity({ ...activity, options: newOptions });
    };

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/admin/activity')}
                    style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex' }}
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{id === 'new' ? '新增活動' : '編輯活動設定'}</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* 基本資訊 */}
                    <div className="admin-card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={20} color="var(--primary)" /> 基本資訊
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#64748b' }}>活動名稱</label>
                                <input
                                    type="text"
                                    value={activity.name}
                                    onChange={(e) => setActivity({ ...activity, name: e.target.value })}
                                    style={{ width: '100%', color: '#1e293b', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                                    placeholder="請輸入活動名稱"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#64748b' }}>活動說明</label>
                                <textarea
                                    rows={4}
                                    value={activity.description}
                                    onChange={(e) => setActivity({ ...activity, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', color: '#1e293b', border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0.5rem', outline: 'none' }}
                                    placeholder="請輸入活動詳細說明..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* 預約選項設定 */}
                    <div className="admin-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <List size={20} color="var(--primary)" /> 下拉選項設定
                            </h3>
                            <button
                                onClick={addOption}
                                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}
                            >
                                <Plus size={18} /> 新增選項
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {activity.options.map((opt, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="text"
                                            value={opt.name}
                                            onChange={(e) => updateOption(idx, 'name', e.target.value)}
                                            placeholder="選項名稱 (如: 基礎療程)"
                                            style={{ width: '100%', border: 'none', background: 'transparent', padding: '0.25rem 0' }}
                                        />
                                    </div>
                                    <div style={{ width: '120px' }}>
                                        <input
                                            type="text"
                                            value={opt.duration}
                                            onChange={(e) => updateOption(idx, 'duration', e.target.value)}
                                            placeholder="時間 (如: 60)"
                                            style={{ width: '100%', border: 'none', background: 'transparent', padding: '0.25rem 0' }}
                                        />
                                    </div>
                                    <button onClick={() => removeOption(idx)} style={{ color: '#ef4444', background: 'transparent', border: 'none' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* 客戶資料欄位 */}
                    <div className="admin-card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>填寫資訊要求</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={activity.requireEmail} onChange={(e) => setActivity({ ...activity, requireEmail: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Mail size={18} color="#64748b" /> <span>要求填寫 Email</span>
                                </div>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={activity.requirePhone} onChange={(e) => setActivity({ ...activity, requirePhone: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Phone size={18} color="#64748b" /> <span>要求填寫 Phone</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* 選擇營業時間 */}
                    <div className="admin-card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={20} color="var(--primary)" /> 選擇營業時間
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {/* 這裡模擬從 OpeningHours 獲取的模板列表 */}
                            {['一般營業時間', '假日特別時段', '春季限時段'].map((item, idx) => (
                                <label key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    background: activity.selectedOpeningHours.includes(idx + 1) ? '#f0f9ff' : 'transparent',
                                    border: activity.selectedOpeningHours.includes(idx + 1) ? '1px solid #bae6fd' : '1px solid #e2e8f0'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={activity.selectedOpeningHours.includes(idx + 1)}
                                        onChange={(e) => {
                                            const val = idx + 1;
                                            const current = activity.selectedOpeningHours;
                                            setActivity({
                                                ...activity,
                                                selectedOpeningHours: e.target.checked ? [...current, val] : current.filter(v => v !== val)
                                            });
                                        }}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item}</span>
                                </label>
                            ))}
                        </div>
                        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>※ 可複選多個營業時間模板</p>
                    </div>

                    <button
                        onClick={() => navigate('/admin/activity')}
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)' }}
                    >
                        <Save size={20} /> 儲存活動設定
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActivityEdit;
