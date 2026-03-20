'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { User, Phone, Mail, Loader2, ListTodo, ArrowRight } from 'lucide-react';
import { generateUid } from '@/lib/id';
import { callGasApi } from '@/lib/database';

export default function RegisterPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    // 取得參數
    const line_uid = searchParams.get('line_uid');
    const manager_uid = searchParams.get('manager_uid');
    const questionnaire = searchParams.get('questionnaire');
    const return_url = searchParams.get('return_url');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });

    const parsedQuestionnaire = useMemo(() => {
        if (!questionnaire) return [];
        try {
            return JSON.parse(decodeURIComponent(questionnaire));
        } catch {
            return [];
        }
    }, [questionnaire]);

    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [otherInputs, setOtherInputs] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAttempted, setIsAttempted] = useState(false);

    const isPhoneValid = useMemo(() => {
        if (!formData.phone) return false;
        const cleanPhone = formData.phone.replace(/[- ]/g, '');
        return /^09\d{8}$/.test(cleanPhone);
    }, [formData.phone]);

    const isEmailValid = useMemo(() => {
        if (!formData.email) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    }, [formData.email]);

    const isQuestionnaireComplete = useMemo(() => {
        for (const q of parsedQuestionnaire) {
            if (!answers[q.title]) return false;
            if (answers[q.title] === '__OTHER__' && !otherInputs[q.title]?.trim()) return false;
        }
        return true;
    }, [answers, otherInputs, parsedQuestionnaire]);

    const handleRegister = async () => {
        setIsAttempted(true);
        if (!formData.name || !isPhoneValid || !isEmailValid || !isQuestionnaireComplete) {
            return;
        }

        setIsSubmitting(true);
        try {
            const now = new Date().toISOString();
            const memberUid = generateUid();

            const finalAnswers = parsedQuestionnaire.map((q: any) => {
                const raw = answers[q.title];
                const ans = raw === '__OTHER__' ? (otherInputs[q.title]?.trim() || '') : (raw || '');
                return { title: q.title, ans };
            });
            const answersJsonString = JSON.stringify(finalAnswers);

            const data = {
                uid: memberUid,
                manager_uid: manager_uid || '',
                name: formData.name,
                line_uid: line_uid || '',
                phone: formData.phone.replace(/[- ]/g, ''),
                email: formData.email,
                questionnaire: answersJsonString,
                status: 1,
                create_at: now,
                update_at: now
            };

            const result = await callGasApi({
                action: 'insert',
                table: 'member',
                data: data
            });

            if (result !== null) {
                queryClient.removeQueries({ queryKey: ['booking_member_event'] });
                router.replace(return_url || '/booking');
            } else {
                alert('註冊失敗，請重試！');
            }
        } catch (error) {
            alert('發生錯誤，請稍後再試。');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '3rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'absolute', top: -100, right: -100, width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--primary-soft) 0%, transparent 70%)', zIndex: 0 }} />
            
            <div style={{ width: '100%', maxWidth: '520px', padding: '1rem', zIndex: 1, marginTop: '2rem' }}>
                <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>成為會員，開始預約</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' }}>只需填寫基本資料與服務偏好，即可享受專屬服務！</p>
                </header>

                <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>姓名*</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>電話*</label>
                            <input type="tel" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>信箱*</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} style={{ width: '100%' }} />
                        </div>
                    </div>

                    {parsedQuestionnaire.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155' }}>偏好問卷</h2>
                            {parsedQuestionnaire.map((q: any, idx: number) => (
                                <div key={idx}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>{q.title}*</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {q.options?.map((opt: any, optIdx: number) => (
                                            <button 
                                                key={optIdx} 
                                                onClick={() => setAnswers(prev => ({ ...prev, [q.title]: opt.title }))}
                                                style={{ background: answers[q.title] === opt.title ? 'var(--primary-gradient)' : '#fff', color: answers[q.title] === opt.title ? '#fff' : '#64748b', borderRadius: '2rem', padding: '0.5rem 1rem', border: '1px solid #e2e8f0' }}
                                            >
                                                {opt.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button className="primary" onClick={handleRegister} disabled={isSubmitting}>
                        {isSubmitting ? '處理中...' : '送出資料'} <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
