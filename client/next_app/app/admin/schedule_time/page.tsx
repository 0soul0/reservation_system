'use client';

import React from 'react';
import { Clock, Plus, RefreshCcw, Loader2, ChevronRight, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callGasApi } from '@/lib/database';
import { useAuth } from '@/lib/auth';
import type { ScheduleMenu, ScheduleTime, ScheduleMenuWithTimes } from '@/types';

const DAY_LABELS = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];

export default function ScheduleTimeListPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { manager } = useAuth();
    const [isManualRefetching, setIsManualRefetching] = React.useState(false);

    const {
        data: menuList = [],
        isLoading,
        isFetching,
        error,
        refetch,
        dataUpdatedAt,
    } = useQuery({
        queryKey: ['schedule_menus', manager?.uid],
        queryFn: async (): Promise<ScheduleMenuWithTimes[]> => {
            const res = await callGasApi<{ menus: ScheduleMenu[]; times: ScheduleTime[] }>({
                action: 'call',
                procedure: 'getManagerScheduleConfig',
                params: [manager?.uid]
            });

            const finalMenus = res?.menus || [];
            const finalTimes = res?.times || [];

            return finalMenus.map((menu) => ({
                ...menu,
                times: finalTimes.filter((t: ScheduleTime) => t.schedule_menu_uid === menu.uid),
            }));
        },
        enabled: !!manager?.uid,
        staleTime: 1000 * 60 * 5,
    });

    const deleteMutation = useMutation({
        mutationFn: async (uid: string) => {
            if (!window.confirm('確定要刪除此排程模板嗎？')) return;
            await Promise.all([
                callGasApi({ action: "delete", table: "schedule_time", where: `schedule_menu_uid = '${uid}'` }),
                callGasApi({ action: "delete", table: "schedule_override", where: `schedule_menu_uid = '${uid}'` }),
                callGasApi({ action: "delete", table: "schedule_menu", where: `uid = '${uid}'` }),
            ]);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedule_menus'] });
        },
        onError: (err: any) => alert(err.message),
    });

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>營業時間</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="primary" onClick={() => router.push('/admin/schedule_time/new')}><Plus size={18} /> 新增時程</button>
                    <button onClick={async () => { setIsManualRefetching(true); await refetch(); setIsManualRefetching(false); }} disabled={isFetching}><RefreshCcw size={16} className={isFetching ? 'animate-spin' : ''} /> 刷新</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
                {(isLoading || (isFetching && !isManualRefetching)) ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center' }}><Loader2 className="animate-spin" size={32} /></div>
                ) : (
                    menuList.map((menu) => (
                        <div key={menu.uid} className="admin-card" onClick={() => router.push(`/admin/schedule_time/${menu.uid}`)} style={{ cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3>{menu.name}</h3>
                                <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(menu.uid); }} style={{ color: 'red' }}><Trash2 size={18} /></button>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                                {DAY_LABELS.map((label, dow) => {
                                    const slots = menu.times.filter((t) => t.day_of_week === dow);
                                    return (
                                        <div key={dow} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                                            <span>{label}</span>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {slots.length > 0 ? slots.map(s => <span key={s.uid}>{s.time_range}</span>) : <span>休息</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
