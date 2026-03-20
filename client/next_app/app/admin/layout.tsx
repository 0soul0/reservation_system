'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, manager, logout } = useAuth();
    const [logoError, setLogoError] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // 防止未登入訪問
    useEffect(() => {
        if (!isLoggedIn) {
            router.replace('/');
        }
    }, [isLoggedIn, router]);

    if (!isLoggedIn) return null;

    const navItems = [
        { label: '會員管理', path: '/admin/members', icon: Users },
        { label: '排程時間', path: '/admin/schedule_time', icon: Calendar },
        { label: '活動設定', path: '/admin/event', icon: Settings },
        { label: '預約管理', path: '/admin/bookings', icon: Calendar },
    ];

    return (
        <div className="admin-container">
            <div className="sidebar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                    <div style={{
                        background: 'var(--primary)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        {manager?.logo_url && !logoError ? (
                            <img
                                src={manager.logo_url.startsWith('http') ? manager.logo_url : `/logo/${manager.logo_url}`}
                                alt="Logo"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={() => setLogoError(true)}
                            />
                        ) : (
                            <Settings size={22} color="white" />
                        )}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>{manager?.website_name || '管理系統'}</h2>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{manager?.account}</div>
                    </div>
                </div>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.path);
                    return (
                        <Link 
                            key={item.path} 
                            href={item.path} 
                            className={`sidebar-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}

                <div style={{ marginTop: 'auto' }}>
                    <button
                        onClick={logout}
                        className="sidebar-item"
                        style={{ marginTop: '2rem', color: '#ef4444', width: '100%', background: 'transparent', textAlign: 'left' }}
                    >
                        <LogOut size={20} />
                        <span>登出系統</span>
                    </button>
                </div>
            </div>

            <div className="main-content">
                {children}
            </div>
        </div>
    );
}
