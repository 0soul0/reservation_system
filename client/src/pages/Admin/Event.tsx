import React from 'react';
import { Edit2, Trash2, Loader2, RefreshCcw, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { executeSQL, executeNonQuery } from '../../utils/database';
import { useAuth } from '../../utils/auth';
import { QUERY_CONFIG } from '../../utils/constants';

export interface EventData {
    uid: string;
    manager_uid: string;
    title: string;
    description: string;
    is_phone_required: number;
    is_email_required: number;
    business_hours_ids: string;
    booking_dynamic_url: string;
    create_at: string;
    update_at: string;
    options: string; // JSON string: {"name": "Category", "items": [{"title": "Item", "duration": 60}]}
}

const Event: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { manager } = useAuth();

    // 取得活動列表
    const {
        data: events = [],
        isLoading,
        isFetching,
        error,
        refetch,
        dataUpdatedAt
    } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            console.log("Fetching events...");
            const sql = `SELECT * FROM event WHERE manager_uid = '${manager?.uid}' ORDER BY create_at DESC`;
            const result = await executeSQL<EventData>(sql);
            return result;
        },
        enabled: !!manager?.uid,
        staleTime: QUERY_CONFIG.STALE_TIME,
    });

    // 刪除處理
    const deleteMutation = useMutation({
        mutationFn: async (uid: string) => {
            if (!confirm('確定要刪除此活動嗎？')) return;
            const success = await executeNonQuery(`DELETE FROM event WHERE uid = '${uid}'`);
            if (!success) throw new Error('刪除失敗');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
        onError: (err: any) => alert(err.message)
    });





    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>活動設定</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <p style={{ color: '#71717a', fontSize: '1rem' }}>管理您的所有預約活動與服務項目</p>
                        {dataUpdatedAt > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#94a3b8', fontSize: '0.8125rem', paddingLeft: '1rem', borderLeft: '1px solid #e2e8f0' }}>
                                <Clock size={14} />
                                最後更新：{new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                        padding: '0.625rem 1rem',
                        fontSize: '0.875rem',
                        borderRadius: '0.5rem'
                    }}
                >
                    <RefreshCcw size={16} className={isFetching ? "animate-spin" : ""} />
                    {isFetching ? '更新中...' : '手動刷新'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                <div
                    onClick={() => navigate('/admin/event/new')}
                    className="admin-card"
                    style={{ border: '2px dashed #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '220px', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', color: 'var(--primary)' }}><Plus size={32} /></div>
                    <p style={{ fontWeight: 700, fontSize: '1.125rem' }}>創建新活動</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.7 }}>點擊開始設定新的服務或活動</p>
                </div>

                {isLoading ? (
                    <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                    </div>
                ) : error ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#ef4444' }}>
                        讀取失敗: {(error as Error).message}
                    </div>
                ) : events.length === 0 ? null : (
                    events.map(event => (
                        <div key={event.uid} className="admin-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        color: 'var(--primary)',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {event.booking_dynamic_url ? "已發佈" : "草稿"}
                                    </span>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{event.create_at.split('T')[0]}</div>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1e293b' }}>{event.title}</h3>
                                <p style={{ color: '#64748b', fontSize: '0.925rem', marginBottom: '1.5rem', minHeight: '2.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {event.description || '暫無說明'}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                                <button
                                    onClick={() => navigate(`/admin/event/${event.uid}`)}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.625rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}
                                >
                                    <Edit2 size={16} /> 編輯
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate(event.uid)}
                                    title="刪除活動"
                                    style={{
                                        width: '42px',
                                        height: '42px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#fef2f2',
                                        border: '1px solid #fee2e2',
                                        color: '#eb8566ff',
                                        borderRadius: '0.5rem',
                                        padding: 0,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = '#fef2f2')}
                                >
                                    <Trash2 size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Event;
