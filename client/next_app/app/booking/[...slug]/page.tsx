'use client';

import React, { useState, useMemo, useEffect, use } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, ChevronRight, ChevronLeft, CheckCircle2, Loader2, Edit, ChevronDown, Check } from 'lucide-react';
import { callGasApi } from '@/lib/database';
import type { EventData, ScheduleTime, ScheduleOverride, BookingCache } from '@/types';
import { generateUid } from '@/lib/id';
import { TIME_SLOT_INTERVAL } from '@/lib/constants';

const formatDate = (date: Date | string) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

export default function BookingPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const resolvedParams = use(params);
    const slug = resolvedParams.slug || [];
    const websiteNameFromUrl = slug[0] || '';
    const dynamicUrlFromUrl = slug[1] || '';

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const scheduleMenuUid = searchParams.get('schedule_menu_uid');
    const lineUidFromUrl = searchParams.get('line_uid');

    // ── State ──────────────────────────────────────────────────────────────────
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        selectedService: null as any,
    });
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [isFirstStepAttempted, setIsFirstStepAttempted] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [slotTime, setSlotTime] = useState("");

    // ── Cache Logic ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const cached = localStorage.getItem('booking_user_cache');
        if (cached) {
            try {
                const { name, phone, email } = JSON.parse(cached);
                setFormData(prev => ({
                    ...prev,
                    name: name || prev.name,
                    phone: phone || prev.phone,
                    email: email || prev.email,
                }));
            } catch (e) {
                console.error("Failed to parse user cache", e);
            }
        }
    }, []);

    useEffect(() => {
        const cacheData = {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
        };
        localStorage.setItem('booking_user_cache', JSON.stringify(cacheData));
    }, [formData.name, formData.phone, formData.email]);

    // ── Validation ─────────────────────────────────────────────────────────────
    const isPhoneValid = useMemo(() => {
        if (!formData.phone) return true;
        const cleanPhone = formData.phone.replace(/[- ]/g, '');
        return /^09\d{8}$/.test(cleanPhone);
    }, [formData.phone]);

    const isEmailValid = useMemo(() => {
        if (!formData.email) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    }, [formData.email]);

    // ── Queries ────────────────────────────────────────────────────────────────

    const { data: memberEventInfo, isLoading: isEventLoading } = useQuery({
        queryKey: ['booking_member_event', lineUidFromUrl, pathname, websiteNameFromUrl, scheduleMenuUid],
        queryFn: async () => {
            const res = await callGasApi<any>({
                action: 'call',
                procedure: 'getMemberEventInfo',
                params: [lineUidFromUrl || '', pathname, websiteNameFromUrl || '', scheduleMenuUid || '']
            });
            return res || null;
        },
        enabled: !!websiteNameFromUrl && !!pathname
    });

    const event = memberEventInfo?.event as EventData | null | undefined;
    const scheduleData = memberEventInfo ? {
        times: (memberEventInfo.schedule_time || []) as ScheduleTime[],
        overrides: (memberEventInfo.schedule_override || []) as ScheduleOverride[]
    } : undefined;
    const bookingCache = (memberEventInfo?.booking_cache || []) as BookingCache[];

    useEffect(() => {
        if (memberEventInfo && memberEventInfo.is_member === false) {
            const queryStrings = searchParams.toString();
            const returnUrl = pathname + (queryStrings ? '?' + queryStrings : '');
            
            // Redirect to register
            const registerParams = new URLSearchParams();
            registerParams.set('line_uid', lineUidFromUrl || '');
            registerParams.set('manager_uid', event?.manager_uid || '');
            registerParams.set('questionnaire', memberEventInfo.questionnaire || '');
            registerParams.set('return_url', returnUrl);
            
            router.replace(`/register?${registerParams.toString()}`);
        }
    }, [memberEventInfo, lineUidFromUrl, router, pathname, searchParams, event?.manager_uid]);

    const timeToMinutes = (t: string) => {
        if (!t) return 0;
        const [h, m] = t.trim().split(':').map(Number);
        return h * 60 + (m || 0);
    };

    const minutesToTime = (m: number) => {
        const h = Math.floor(m / 60);
        const mm = m % 60;
        return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    };

    const getAvailableSlots = (date: Date) => {
        if (!scheduleData) return [];
        const dateStr = formatDate(date);

        const dayOverrides = scheduleData.overrides.filter(o => formatDate(new Date(o.override_date)) === dateStr);
        let activeRules: { start: number, end: number, cap: number, last: number }[] = [];

        if (dayOverrides.length > 0) {
            activeRules = dayOverrides.filter(o => !o.is_closed).map(o => {
                const times = o.override_time.split('-').map(s => s.trim());
                const s = timeToMinutes(times[0]);
                const e = timeToMinutes(times[1]);
                return { start: s, end: e, cap: o.max_capacity, last: e };
            });
        } else {
            let dow = date.getDay();
            if (dow === 0) dow = 7;
            activeRules = scheduleData.times
                .filter(t => t.day_of_week === dow && (String(t.is_open) === 'true' || t.is_open === true || Number(t.is_open) === 1))
                .map(t => {
                    const times = t.time_range.split('-').map(s => s.trim());
                    const s = timeToMinutes(times[0]);
                    const e = timeToMinutes(times[1]);
                    const last = (String(t.is_open_last_booking_time) === 'true' || t.is_open_last_booking_time === true || Number(t.is_open_last_booking_time) === 1)
                        ? timeToMinutes(t.last_booking_time) : e;
                    return { start: s, end: e, cap: t.max_capacity, last: last };
                });
        }

        if (activeRules.length === 0) return [];

        const rawSlots: { uid: string, time_range: string, max_capacity: number, available_capacity: number, start_minutes: number }[] = [];
        const minStart = Math.min(...activeRules.map(r => r.start));
        const maxEnd = Math.max(...activeRules.map(r => r.end));

        for (let time = minStart; time + 30 <= maxEnd; time += 30) {
            let bestCap = -1;
            for (const rule of activeRules) {
                if (time >= rule.start && (time + 30) <= rule.end && time <= rule.last) {
                    if (rule.cap > bestCap) bestCap = rule.cap;
                }
            }

            if (bestCap > 0) {
                const slotStartStr = `${dateStr} ${minutesToTime(time)}`;
                const cached = bookingCache.find(bc => bc.booking_start_time.startsWith(slotStartStr));
                const bookedCount = cached ? Number(cached.booked_count) : 0;
                const available = bestCap - bookedCount;
                if (available > 0) {
                    rawSlots.push({
                        uid: `${dateStr}_${minutesToTime(time)}`,
                        time_range: `${minutesToTime(time)}-${minutesToTime(time + 30)}`,
                        max_capacity: bestCap,
                        available_capacity: available,
                        start_minutes: time
                    });
                }
            }
        }

        const serviceDuration = formData.selectedService ? Number(formData.selectedService.duration) : 30;
        const requiredBlocks = Math.ceil(serviceDuration / 30);
        const validSlots = [];

        for (let i = 0; i < rawSlots.length; i++) {
            let isValid = true;
            for (let j = 0; j < requiredBlocks; j++) {
                const targetBlock = rawSlots[i + j];
                if (!targetBlock || targetBlock.start_minutes !== (rawSlots[i].start_minutes + j * 30)) {
                    isValid = false;
                    break;
                }
            }
            if (isValid) {
                validSlots.push({
                    uid: rawSlots[i].uid,
                    time_range: rawSlots[i].time_range,
                    max_capacity: rawSlots[i].max_capacity,
                    available_capacity: rawSlots[i].available_capacity
                });
            }
        }
        return validSlots;
    };

    const handleConfirmBooking = async () => {
        if (!event || !selectedDate || !selectedTimeSlot || !formData.selectedService) return;

        const bookingUid = generateUid();
        const computedDuration = Math.ceil(Number(formData.selectedService.duration) / 30) * 30;
        const dateStr = formatDate(selectedDate);
        const startTimePart = selectedTimeSlot.split('_')[1];
        const startDateTime = `${dateStr} ${startTimePart}`;
        const startMinutes = timeToMinutes(startTimePart);
        const endMinutes = startMinutes + computedDuration;
        const endDateTime = `${dateStr} ${minutesToTime(endMinutes)}`;
        
        const allDaySlots = getAvailableSlots(selectedDate);
        const max_capacity_array: number[] = [];
        for (let time = startMinutes; time < endMinutes; time += 30) {
            const timeStr = minutesToTime(time);
            const slot = allDaySlots.find(s => s.uid === `${dateStr}_${timeStr}`);
            if (slot) max_capacity_array.push(slot.max_capacity);
        }

        const bookingData = {
            uid: bookingUid,
            line_uid: lineUidFromUrl,
            name: formData.name,
            phone: formData.phone,
            booking_start_time: startDateTime,
            booking_end_time: endDateTime,
            service_item: formData.selectedService.title,
            service_computed_duration: computedDuration,
            manager_uid: event.manager_uid,
            time_slot_interval: TIME_SLOT_INTERVAL,
            max_capacity_array
        };
        
        setSlotTime(`${startTimePart}-${minutesToTime(endMinutes)} (${computedDuration}分鐘)`);
        setIsSubmitting(true);
        try {
            const result = await callGasApi({
                action: "call",
                procedure: "submitBooking",
                params: [bookingData]
            });

            if (result && result.status !== "fail") {
                setStep(3);
            } else {
                alert("預約失敗，請稍後再試。");
            }
        } catch (error) {
            console.error("Booking Submit Failed:", error);
            alert("預約失敗，請稍後再試。");
        } finally {
            setIsSubmitting(false);
        }
    };

    const eventOptions = useMemo(() => {
        if (!event?.options) return { name: '', items: [] };
        try { return JSON.parse(event.options); } catch { return { name: '', items: [] }; }
    }, [event]);

    if (isEventLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                    <p style={{ color: '#94a3b8', fontWeight: 500 }}>正在開啟預約門扉...</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
                <div style={{ background: '#fff', padding: '3rem', borderRadius: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#1e293b' }}>網址已失效或不存在</h1>
                    <p style={{ color: '#64748b', maxWidth: '300px' }}>請聯繫服務商家獲取最新的預約連結。</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -100, right: -100, width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--primary-soft) 0%, transparent 70%)', zIndex: 0 }} />
            
            <div className={`booking-layout-container`} style={{ maxWidth: (step === 1 || step === 2) ? '1000px' : '520px' }}>
                <header style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(24px)',
                    position: 'sticky',
                    top: '0.75rem',
                    zIndex: 50,
                    margin: '0.75rem -1rem 1.25rem -1rem',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '1rem',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden', flexShrink: 0 }}>
                            {event.logo_url ? <img src={event.logo_url.startsWith('http') ? event.logo_url : `/logo/${event.logo_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logo" /> : <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{event.title[0]}</div>}
                        </div>
                        <h1 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{event.title}</h1>
                    </div>
                </header>

                <div style={{ padding: '1rem' }}>
                    {/* Progress */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        {[1, 2, 3].map((s) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    background: step === s ? 'var(--primary-gradient)' : step > s ? '#22c55e' : '#fff',
                                    color: step >= s ? '#fff' : '#cbd5e1',
                                    border: step >= s ? 'none' : '2px solid #e2e8f0',
                                }}>
                                    {step > s ? <CheckCircle2 size={16} /> : s}
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: step >= s ? '#1e293b' : '#94a3b8' }}>
                                    {s === 1 ? '基本資訊' : s === 2 ? '選擇時間' : '預約成功'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <section className="admin-card">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.8rem' }}>活動介紹</h2>
                                        <div style={{ color: '#475569', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{event.description || '暫無活動說明'}</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <h2 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>您的聯絡資訊</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            <input type="text" placeholder="姓名*" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                                            {event.is_phone_required && <input type="tel" placeholder="電話*" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />}
                                            {event.is_email_required && <input type="email" placeholder="信箱*" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />}
                                            
                                            <button 
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                style={{ textAlign: 'left', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}
                                            >
                                                <span>{formData.selectedService ? formData.selectedService.title : '選擇服務項目*'}</span>
                                                <ChevronDown size={18} />
                                            </button>
                                            
                                            {isDropdownOpen && (
                                                <div className="admin-card" style={{ padding: '0.5rem', position: 'absolute', zIndex: 10 }}>
                                                    {eventOptions.items.map((item: any, idx: number) => (
                                                        <div key={idx} onClick={() => { setFormData(p => ({ ...p, selectedService: item })); setIsDropdownOpen(false); }} style={{ padding: '0.5rem', cursor: 'pointer' }}>
                                                            {item.title} ({item.duration}分)
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <button className="primary" onClick={() => setStep(2)}>繼續選擇時間 <ChevronRight size={18} /></button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="responsive-grid">
                                <section className="admin-card">
                                    <SimpleCalendar selected={selectedDate} onSelect={setSelectedDate} />
                                </section>
                                <section className="admin-card">
                                    <h2 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748b', marginBottom: '1rem' }}>選擇時段</h2>
                                    {selectedDate ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.6rem' }}>
                                            {getAvailableSlots(selectedDate).map((slot, idx) => (
                                                <button 
                                                    key={idx} 
                                                    onClick={() => setSelectedTimeSlot(slot.uid)}
                                                    style={{ background: selectedTimeSlot === slot.uid ? 'var(--primary-soft)' : '#fff', borderColor: selectedTimeSlot === slot.uid ? 'var(--primary)' : '#e2e8f0', border: '1px solid' }}
                                                >
                                                    {slot.time_range}
                                                </button>
                                            ))}
                                        </div>
                                    ) : <p>請選擇日期</p>}
                                </section>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button style={{ flex: 1 }} onClick={() => setStep(1)}>上一步</button>
                                <button className="primary" style={{ flex: 2 }} onClick={handleConfirmBooking} disabled={isSubmitting}>
                                    {isSubmitting ? '處理中...' : '確認預約'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in admin-card" style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>預約成功！</h2>
                            <p>我們已收到您的預約申請。</p>
                            <button onClick={() => window.location.reload()}>繼續預約</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const SimpleCalendar = ({ selected, onSelect }: { selected: Date | null, onSelect: (d: Date) => void }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [viewDate, setViewDate] = useState(new Date(selected || today));

    const weeks = ['日', '一', '二', '三', '四', '五', '六'];
    const days: Date[] = [];
    const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const startOffset = startOfMonth.getDay();
    const totalDays = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

    for (let i = 0; i < totalDays; i++) days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 800 }}>{viewDate.getFullYear()}年 {viewDate.getMonth() + 1}月</span>
                <div>
                    <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}><ChevronLeft size={16} /></button>
                    <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}><ChevronRight size={16} /></button>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
                {weeks.map(w => <div key={w} style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{w}</div>)}
                {Array(startOffset).fill(null).map((_, i) => <div key={i} />)}
                {days.map(date => (
                    <div 
                        key={date.toISOString()} 
                        onClick={() => date >= today && onSelect(new Date(date))}
                        style={{ background: selected?.getTime() === date.getTime() ? 'var(--primary-gradient)' : 'none', color: selected?.getTime() === date.getTime() ? '#fff' : date < today ? '#e2e8f0' : '#475569', cursor: date < today ? 'not-allowed' : 'pointer', padding: '0.5rem', borderRadius: '0.5rem' }}
                    >
                        {date.getDate()}
                    </div>
                ))}
            </div>
        </div>
    );
};
