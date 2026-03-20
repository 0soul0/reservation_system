'use client';

import React from 'react';
import { Edit2, Trash2, Loader2, RefreshCcw, Clock, Plus, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callGasApi } from '@/lib/database';
import { useAuth } from '@/lib/auth';
import type { EventData } from '@/types';

export default function EventListPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { manager } = useAuth();
    const [isManualRefetching, setIsManualRefetching] = React.useState(false);

    // 取得活動列表
    const {
        data: { events = [], menus = [] } = {},
        isLoading,
        isFetching,
        error,
        refetch,
        dataUpdatedAt
    } = useQuery({
        queryKey: ['events_and_menus', manager?.uid],
        queryFn: async () => {
            const [events, menus] = await Promise.all([
                callGasApi<EventData[]>({
                    action: "select",
                    table: 'event',
                    where: `manager_uid = '${manager?.uid}' ORDER BY create_at DESC`
                }),
                callGasApi<{ uid: string; name: string }[]>({
                    action: "select",
                    table: 'schedule_menu',
                    where: `manager_uid = '${manager?.uid}'`
                })
            ]);
            return { 
                events: Array.isArray(events) ? events : [], 
                menus: Array.isArray(menus) ? menus : [] 
            };
        },
        enabled: !!manager?.uid,
        staleTime: 1000 * 60 * 5,
    });

    // 刪除處理
    const deleteMutation = useMutation({
        mutationFn: async (uid: string) => {
            if (!confirm('確定要刪除此活動嗎？')) return;
            const res = await callGasApi({
                action: "delete",
                table: "event",
                where: `uid = '${uid}'`
            });
            if (!res) throw new Error('刪除失敗');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events_and_menus'] });
        },
        onError: (err: any) => alert(err.message)
    });

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em', margin: 0 }}>活動設定</h1>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        className="primary" 
                        onClick={() => router.push('/admin/event/new')}
                    >
                        <Plus size={18} /> 新增活動
                    </button>
                    <button 
                        onClick={async () => { setIsManualRefetching(true); await refetch(); setIsManualRefetching(false); }}
                        disabled={isFetching}
                        style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '0.625rem 1rem' }}
                    >
                        <RefreshCcw size={16} className={isFetching ? 'animate-spin' : ''} />
                        手動刷新
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {(isLoading || (isFetching && !isManualRefetching)) ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '8rem' }}><Loader2 className="animate-spin" size={48} /></div>
                ) : (
                    events.map(event => (
                        <div key={event.uid} className="admin-card">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{event.title}</h3>
                            <p style={{ color: '#64748b', margin: '1rem 0' }}>{event.description || '暫無說明'}</p>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                {(() => {
                                    try {
                                        const selectedMenus = JSON.parse(event.schedule_menu_uid || '[]');
                                        return selectedMenus.map((sm: { uid: string }) => {
                                            const menuInfo = menus.find(m => m.uid === sm.uid);
                                            return (
                                                <button 
                                                    key={sm.uid} 
                                                    onClick={() => {
                                                        const url = `${event.booking_dynamic_url}?schedule_menu_uid=${sm.uid}&line_uid=`;
                                                        window.open(url, '_blank');
                                                    }}
                                                    style={{ background: '#eef2ff', color: '#4f46e5', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem' }}
                                                >
                                                    <ExternalLink size={12} /> {menuInfo?.name || '專屬預約'}
                                                </button>
                                            );
                                        });
                                    } catch { return null; }
                                })()}
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                                <button style={{ flex: 1 }} onClick={() => router.push(`/admin/event/${event.uid}`)}>
                                    <Edit2 size={16} /> 編輯活動
                                </button>
                                <button style={{ background: '#fef2f2', color: 'red' }} onClick={() => deleteMutation.mutate(event.uid)}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
