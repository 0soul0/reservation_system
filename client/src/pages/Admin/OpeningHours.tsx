import React, { useState } from 'react';
import { Clock, Plus, Trash2, ChevronLeft, Save, CheckCircle2, Circle } from 'lucide-react';

interface DaySchedule {
    enabled: boolean;
    periods: string[];
}

interface TimeTemplate {
    id: number;
    name: string;
    schedule: Record<string, DaySchedule>;
}

const DAYS = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];

const OpeningHours: React.FC = () => {
    const [editingTemplate, setEditingTemplate] = useState<TimeTemplate | null>(null);

    const createDefaultSchedule = () => {
        const schedule: Record<string, DaySchedule> = {};
        DAYS.forEach(day => {
            schedule[day] = { enabled: true, periods: ['09:00-18:00'] };
        });
        return schedule;
    };

    const [templates, setTemplates] = useState<TimeTemplate[]>([
        {
            id: 1,
            name: '一般營業時間',
            schedule: createDefaultSchedule()
        },
        {
            id: 2,
            name: '夜間營業時段',
            schedule: {
                '週一': { enabled: true, periods: ['20:00-23:30'] },
                '週二': { enabled: true, periods: ['20:00-23:30'] },
                '週三': { enabled: true, periods: ['20:00-23:30'] },
                '週四': { enabled: true, periods: ['20:00-23:30'] },
                '週五': { enabled: true, periods: ['20:00-01:00'] },
                '週六': { enabled: true, periods: ['20:00-01:00'] },
                '週日': { enabled: false, periods: [] },
            }
        }
    ]);

    const addTemplate = () => {
        const newId = templates.length > 0 ? Math.max(...templates.map(t => t.id)) + 1 : 1;
        const newTemplate: TimeTemplate = {
            id: newId,
            name: `新營業時間模板 ${newId}`,
            schedule: createDefaultSchedule()
        };
        setTemplates([...templates, newTemplate]);
        setEditingTemplate(newTemplate);
    };

    const handleEdit = (template: TimeTemplate) => {
        setEditingTemplate(JSON.parse(JSON.stringify(template)));
    };

    const handleSave = () => {
        if (editingTemplate) {
            setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
            setEditingTemplate(null);
        }
    };

    const toggleDay = (day: string) => {
        if (editingTemplate) {
            const newSchedule = { ...editingTemplate.schedule };
            newSchedule[day].enabled = !newSchedule[day].enabled;
            setEditingTemplate({ ...editingTemplate, schedule: newSchedule });
        }
    };

    const addPeriod = (day: string) => {
        if (editingTemplate) {
            const newSchedule = { ...editingTemplate.schedule };
            newSchedule[day].periods = [...newSchedule[day].periods, '09:00-10:00'];
            setEditingTemplate({ ...editingTemplate, schedule: newSchedule });
        }
    };

    const removePeriod = (day: string, index: number) => {
        if (editingTemplate) {
            const newSchedule = { ...editingTemplate.schedule };
            newSchedule[day].periods = newSchedule[day].periods.filter((_, i) => i !== index);
            setEditingTemplate({ ...editingTemplate, schedule: newSchedule });
        }
    };

    const updatePeriod = (day: string, index: number, value: string) => {
        if (editingTemplate) {
            const newSchedule = { ...editingTemplate.schedule };
            newSchedule[day].periods[index] = value;
            setEditingTemplate({ ...editingTemplate, schedule: newSchedule });
        }
    };

    if (editingTemplate) {
        return (
            <div className="animate-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => setEditingTemplate(null)}
                            style={{ background: 'white', border: '1px solid #e2e2e7', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', color: '#71717a' }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#09090b', letterSpacing: '-0.02em' }}>編輯時間模板</h1>
                            <p style={{ fontSize: '0.875rem', color: '#71717a' }}>{editingTemplate.name}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => setEditingTemplate(null)} style={{ background: '#f4f4f5', color: '#18181b', border: 'none' }}>取消</button>
                        <button className="primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Save size={18} /> 儲存設定
                        </button>
                    </div>
                </div>

                <div className="admin-card" style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#09090b' }}>模板名稱</label>
                        <input
                            type="text"
                            value={editingTemplate.name}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                            placeholder="例如：一般營業時間"
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#09090b', marginBottom: '0.5rem' }}>每日時段設定</h3>
                        {DAYS.map(day => {
                            const dayData = editingTemplate.schedule[day];
                            return (
                                <div key={day} style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid',
                                    borderColor: dayData.enabled ? '#e2e2e7' : '#f4f4f5',
                                    background: dayData.enabled ? 'white' : '#fafafa',
                                    transition: 'all 0.2s'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: dayData.periods.length > 0 && dayData.enabled ? '1rem' : 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => toggleDay(day)}>
                                            {dayData.enabled ?
                                                <CheckCircle2 color="#09090b" size={22} fill={dayData.enabled ? "#e2e2e7" : "none"} /> :
                                                <Circle color="#e2e2e7" size={22} />
                                            }
                                            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: dayData.enabled ? '#09090b' : '#a1a1aa' }}>{day}</span>
                                            {!dayData.enabled && <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 500, background: '#f4f4f5', padding: '0.125rem 0.5rem', borderRadius: '1rem' }}>休息</span>}
                                        </div>
                                        {dayData.enabled && (
                                            <button
                                                onClick={() => addPeriod(day)}
                                                style={{ padding: '0.375rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e2e7', background: 'white', color: '#18181b', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                            >
                                                <Plus size={14} /> 增加
                                            </button>
                                        )}
                                    </div>

                                    {dayData.enabled && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                            {dayData.periods.map((period, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <div style={{ position: 'relative', flex: 1 }}>
                                                        <Clock size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                                                        <input
                                                            type="text"
                                                            value={period}
                                                            onChange={(e) => updatePeriod(day, idx, e.target.value)}
                                                            placeholder="09:00-18:00"
                                                            style={{ paddingLeft: '2.5rem', height: '38px', background: 'transparent' }}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => removePeriod(day, idx)}
                                                        style={{ padding: '0.5rem', color: '#ef4444', background: 'transparent', border: 'none' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>營業時間</h1>
                    <p style={{ color: '#71717a', fontSize: '1rem' }}>管理不同活動的適用時段與每週排程</p>
                </div>
                <button
                    className="primary"
                    onClick={addTemplate}
                    style={{
                        padding: '0.75rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        height: 'fit-content'
                    }}
                >
                    <Plus size={18} /> 新增模板
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
                {templates.map(template => (
                    <div key={template.id} className="admin-card" style={{ cursor: 'pointer', padding: '1.75rem', display: 'flex', flexDirection: 'column' }} onClick={() => handleEdit(template)}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#09090b', marginBottom: '0.375rem' }}>{template.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                                <p style={{ color: '#71717a', fontSize: '0.8125rem', fontWeight: 500 }}>設定完成，已供活動關聯</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#fcfcfd', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #f1f1f4' }}>
                            {DAYS.map(day => {
                                const dayData = template.schedule[day];
                                return (
                                    <div key={day} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.8125rem'
                                    }}>
                                        <span style={{ fontWeight: 600, color: dayData.enabled ? '#3f3f46' : '#a1a1aa' }}>{day}</span>
                                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                                            {dayData.enabled ? (
                                                dayData.periods.map((p, i) => (
                                                    <span key={i} style={{ color: '#18181b', fontWeight: 500 }}>{p}</span>
                                                ))
                                            ) : (
                                                <span style={{ color: '#d4d4d8' }}>休息</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f1f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 500 }}>ID: TEMPLATE-{template.id}</span>
                            <div style={{ color: '#09090b', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                詳情 <ChevronLeft size={14} style={{ transform: 'rotate(180deg)' }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OpeningHours;
