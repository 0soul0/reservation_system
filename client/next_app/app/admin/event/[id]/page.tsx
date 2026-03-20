'use client';

import React, { useState, useEffect, use } from 'react';
import { ChevronLeft, Save, Plus, Trash2, X, Clock, Mail, Phone, FileText, List, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callGasApi } from '@/lib/database';
import { useAuth } from '@/lib/auth';
import type { EventData } from '@/types';
import { generateUid } from '@/lib/id';

export default function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const router = useRouter();
    const queryClient = useQueryClient();
    const { manager } = useAuth();

    const [eventState, setEventState] = useState({
        title: '',
        description: '',
        is_email_required: false,
        is_phone_required: true,
        booking_dynamic_url: '',
        website_name: '',
        options: { name: '', items: [] as { title: string, duration: number }[] },
        schedule_menu_uid: [] as { uid: string }[]
    });

    const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
    const [tempOptions, setTempOptions] = useState(eventState.options);

    const { data: dbEvent, isLoading } = useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            if (id === 'new') return null;
            const result = await callGasApi<EventData[]>({
                action: "select",
                table: 'event',
                where: `uid = '${id}' LIMIT 1`
            });
            return Array.isArray(result) ? result[0] : null;
        },
        enabled: id !== 'new',
    });

    const { data: scheduleMenus = [], isLoading: isSchedulesLoading } = useQuery({
        queryKey: ['schedule_menus', manager?.uid],
        queryFn: async () => {
            if (!manager?.uid) return [];
            return await callGasApi<any[]>({
                action: "select",
                table: 'schedule_menu',
                where: `manager_uid = '${manager.uid}'`
            }) || [];
        },
        enabled: !!manager?.uid,
    });

    useEffect(() => {
        if (dbEvent) {
            setEventState({
                title: dbEvent.title || '',
                description: dbEvent.description || '',
                is_email_required: !!dbEvent.is_email_required,
                is_phone_required: !!dbEvent.is_phone_required,
                website_name: manager?.website_name || '',
                booking_dynamic_url: dbEvent.booking_dynamic_url ? dbEvent.booking_dynamic_url.split('/').pop() : '',
                options: dbEvent.options ? JSON.parse(dbEvent.options) : { name: '', items: [] },
                schedule_menu_uid: dbEvent.schedule_menu_uid ? JSON.parse(dbEvent.schedule_menu_uid) : []
            });
        }
    }, [dbEvent, manager?.website_name]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            const uid = id === 'new' ? generateUid() : id;
            const now = new Date().toISOString();
            const data: any = {
                title: eventState.title,
                logo_url: manager?.logo_url,
                description: eventState.description,
                is_phone_required: eventState.is_phone_required ? 1 : 0,
                is_email_required: eventState.is_email_required ? 1 : 0,
                website_name: manager?.website_name,
                options: JSON.stringify(eventState.options),
                schedule_menu_uid: JSON.stringify(eventState.schedule_menu_uid),
                update_at: now
            };

            if (id === 'new') {
                data.uid = uid;
                data.manager_uid = manager?.uid;
                data.create_at = now;
                data.booking_dynamic_url = `/booking/${manager?.website_name}/${eventState.booking_dynamic_url}`;
                await callGasApi({ action: "insert", table: "event", data });
            } else {
                data.booking_dynamic_url = `/booking/${manager?.website_name}/${eventState.booking_dynamic_url}`;
                await callGasApi({
                    action: "update",
                    table: "event",
                    where: `uid = '${id}'`,
                    data
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events_and_menus'] });
            router.push('/admin/event');
        },
        onError: (err: any) => alert(err.message)
    });

    if (isLoading || isSchedulesLoading) return <div style={{ textAlign: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} /></div>;

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => router.push('/admin/event')} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '0.5rem' }}><ChevronLeft size={20} /></button>
                <h1 style={{ flex: 1, fontSize: '1.75rem', fontWeight: 700 }}>{id === 'new' ? '新增活動' : '編輯活動設定'}</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="admin-card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}><FileText size={20} /> 基本資訊</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <input type="text" placeholder="活動名稱" value={eventState.title} onChange={e => setEventState({ ...eventState, title: e.target.value })} style={{ width: '100%' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ background: '#f1f5f9', padding: '0.75rem' }}>/booking/{manager?.website_name}/</div>
                                <input type="text" placeholder="活動路徑" value={eventState.booking_dynamic_url} onChange={e => setEventState({ ...eventState, booking_dynamic_url: e.target.value })} style={{ flex: 1 }} />
                            </div>
                            <textarea placeholder="活動說明" value={eventState.description} onChange={e => setEventState({ ...eventState, description: e.target.value })} style={{ width: '100%', padding: '0.75rem' }} rows={4} />
                        </div>
                    </div>

                    <div className="admin-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}><List size={20} /> 預約服務項目</h3>
                            <button onClick={() => { setTempOptions(JSON.parse(JSON.stringify(eventState.options))); setIsOptionModalOpen(true); }} style={{ background: '#f1f5f9' }}>+ 編輯選單</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                            {eventState.options.items.map((item, idx) => (
                                <div key={idx} style={{ padding: '0.75rem', background: '#fff', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{item.title}</span>
                                    <span style={{ color: '#94a3b8' }}>{item.duration}m</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="admin-card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>預約資料要求</h3>
                        <label style={{ display: 'block' }}><input type="checkbox" checked={eventState.is_email_required} onChange={e => setEventState({ ...eventState, is_email_required: e.target.checked })} /> 要求填寫 Email</label>
                        <label style={{ display: 'block' }}><input type="checkbox" checked={eventState.is_phone_required} onChange={e => setEventState({ ...eventState, is_phone_required: e.target.checked })} /> 要求填寫 手機號碼</label>
                    </div>

                    <div className="admin-card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>適用營業時間</h3>
                        {scheduleMenus.map((item: any) => (
                            <label key={item.uid} style={{ display: 'block' }}>
                                <input 
                                    type="checkbox" 
                                    checked={eventState.schedule_menu_uid.some(s => s.uid === item.uid)}
                                    onChange={e => {
                                        const current = eventState.schedule_menu_uid;
                                        setEventState({
                                            ...eventState,
                                            schedule_menu_uid: e.target.checked ? [...current, { uid: item.uid }] : current.filter(s => s.uid !== item.uid)
                                        });
                                    }}
                                /> {item.name}
                            </label>
                        ))}
                    </div>

                    <button className="primary" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? '儲存中...' : '儲存活動設定'}
                    </button>
                </div>
            </div>

            {isOptionModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header"><h3>編輯服務選單</h3><button onClick={() => setIsOptionModalOpen(false)}><X /></button></div>
                        <div className="modal-body">
                            <input type="text" placeholder="選單名稱" value={tempOptions.name} onChange={e => setTempOptions({ ...tempOptions, name: e.target.value })} style={{ width: '100%', marginBottom: '1rem' }} />
                            {tempOptions.items.map((opt, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <input type="text" placeholder="項目名稱" value={opt.title} onChange={e => {
                                        const items = [...tempOptions.items];
                                        items[idx].title = e.target.value;
                                        setTempOptions({ ...tempOptions, items });
                                    }} style={{ flex: 1 }} />
                                    <input type="number" value={opt.duration} onChange={e => {
                                        const items = [...tempOptions.items];
                                        items[idx].duration = parseInt(e.target.value);
                                        setTempOptions({ ...tempOptions, items });
                                    }} style={{ width: '60px' }} />
                                    <button onClick={() => setTempOptions({ ...tempOptions, items: tempOptions.items.filter((_, i) => i !== idx) })}>x</button>
                                </div>
                            ))}
                            <button onClick={() => setTempOptions({ ...tempOptions, items: [...tempOptions.items, { title: '', duration: 30 }] })}>+ 新增項目</button>
                        </div>
                        <div className="modal-footer"><button className="primary" onClick={() => { setEventState({ ...eventState, options: tempOptions }); setIsOptionModalOpen(false); }}>完成設定</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
