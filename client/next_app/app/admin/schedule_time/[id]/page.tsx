'use client';

import React, { useEffect, useState, use } from 'react';
import { ChevronLeft, Save, Plus, Trash2, Clock, Users, Loader2, Calendar, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callGasApi } from '@/lib/database';
import { generateUid } from '@/lib/id';
import { useAuth } from '@/lib/auth';
import type { ScheduleMenu, ScheduleTime, ScheduleOverride } from '@/types';

const DAY_LABELS = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2).toString().padStart(2, '0');
    const minutes = (i % 2 === 0 ? '00' : '30');
    return `${hours}:${minutes}`;
});
const END_TIME_OPTIONS = [...TIME_OPTIONS.slice(1), '23:59'];

const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toISOString().split('T')[0];
};

const makeTempTime = (menuUid: string, dow: number): ScheduleTime => ({
    uid: generateUid("_new_"),
    schedule_menu_uid: menuUid,
    time_range: '09:00-18:00',
    day_of_week: dow,
    max_capacity: 2,
    is_open: true,
    is_open_last_booking_time: false,
    last_booking_time: '17:00',
    create_at: new Date().toISOString(),
    update_at: new Date().toISOString(),
});

export default function ScheduleTimeEditPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const router = useRouter();
    const queryClient = useQueryClient();
    const { manager } = useAuth();
    const isNew = id === 'new';
    const [targetUid] = useState(() => isNew ? generateUid() : id!);

    const { data, isLoading } = useQuery({
        queryKey: ['schedule_menu', targetUid],
        queryFn: async () => {
            const overrides = await callGasApi<ScheduleOverride[]>({ 
                action: 'select', 
                table: 'schedule_override', 
                where: `schedule_menu_uid = '${targetUid}' ORDER BY override_date DESC` 
            });

            if (isNew) {
                return { menu: { uid: targetUid, name: '未命名模板' }, times: [], overrides: overrides || [] };
            }

            const [menusRes, timesRes] = await Promise.all([
                callGasApi<ScheduleMenu[]>({ action: 'select', table: 'schedule_menu', where: `uid = '${targetUid}' LIMIT 1` }),
                callGasApi<ScheduleTime[]>({ action: 'select', table: 'schedule_time', where: `schedule_menu_uid = '${targetUid}' ORDER BY day_of_week ASC` }),
            ]);

            return { 
                menu: Array.isArray(menusRes) ? menusRes[0] : null, 
                times: Array.isArray(timesRes) ? timesRes : [], 
                overrides: Array.isArray(overrides) ? overrides : [] 
            };
        },
        enabled: !!targetUid,
    });

    const [name, setName] = useState('');
    const [times, setTimes] = useState<ScheduleTime[]>([]);
    const [overrides, setOverrides] = useState<ScheduleOverride[]>([]);
    const [deletedUids, setDeletedUids] = useState<string[]>([]);

    useEffect(() => {
        if (data) {
            setName(data.menu?.name || '');
            setTimes(data.times || []);
            setOverrides(data.overrides || []);
        }
    }, [data]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOverride, setEditingOverride] = useState<ScheduleOverride | null>(null);
    const [tempIsClosed, setTempIsClosed] = useState(false);

    const saveMutation = useMutation({
        mutationFn: async () => {
            const savePayload = {
                menu: { uid: targetUid, manager_uid: manager?.uid || '', name },
                times: times.map(t => ({
                    ...t,
                    uid: t.uid.startsWith('_new_') ? generateUid() : t.uid,
                    schedule_menu_uid: targetUid,
                    is_open: t.is_open ? 1 : 0,
                    is_open_last_booking_time: t.is_open_last_booking_time ? 1 : 0
                })),
                deleted_time_uids: deletedUids
            };

            await callGasApi({
                action: 'call',
                procedure: 'saveScheduleConfig',
                params: [JSON.stringify(savePayload)]
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule_menus'] });
            router.push('/admin/schedule_time');
        },
        onError: (err: any) => alert(err.message),
    });

    if (isLoading) return <div style={{ textAlign: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} /></div>;

    const addSlot = (dow: number) => setTimes(prev => [...prev, makeTempTime(targetUid, dow)]);
    const removeSlot = (uid: string) => {
        setTimes(prev => prev.filter(t => t.uid !== uid));
        if (!uid.startsWith('_new_')) setDeletedUids(prev => [...prev, uid]);
    };
    const updateSlot = (uid: string, key: keyof ScheduleTime, value: any) => {
        setTimes(prev => prev.map(t => t.uid === uid ? { ...t, [key]: value } : t));
    };

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => router.push('/admin/schedule_time')}><ChevronLeft /></button>
                    <h1>{isNew ? '新增排程' : '編輯排程'}</h1>
                </div>
                <button className="primary" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                    <Save size={18} /> {saveMutation.isPending ? '儲存中...' : '儲存'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="admin-card">
                        <label>模板名稱</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%' }} />
                    </div>

                    <div className="admin-card">
                        {DAY_LABELS.map((label, index) => {
                            const dow = index + 1;
                            const slots = times.filter(t => t.day_of_week === dow);
                            return (
                                <div key={index} style={{ marginBottom: '1rem', borderBottom: '1px solid #eee' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>{label}</strong>
                                        <button onClick={() => addSlot(dow)}>+ 增加時段</button>
                                    </div>
                                    {slots.map(slot => (
                                        <div key={slot.uid} style={{ display: 'flex', gap: '1rem', margin: '0.5rem 0' }}>
                                            <input type="text" value={slot.time_range} onChange={e => updateSlot(slot.uid, 'time_range', e.target.value)} style={{ flex: 1 }} />
                                            <input type="number" value={slot.max_capacity} onChange={e => updateSlot(slot.uid, 'max_capacity', parseInt(e.target.value))} style={{ width: '60px' }} />
                                            <button onClick={() => removeSlot(slot.uid)}><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>特別日期</h3>
                        <button onClick={() => setIsModalOpen(true)}>+ 新增</button>
                    </div>
                    {overrides.map(o => (
                        <div key={o.uid} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#f8fafc' }}>
                            {formatDateForInput(o.override_date)} {o.is_closed ? '(休息)' : o.override_time}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
