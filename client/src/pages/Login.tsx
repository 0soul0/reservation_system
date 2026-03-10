import React from 'react';
import { LogIn, User, Lock, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        window.location.href = '/admin/members';
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-gradient)',
            padding: '1rem'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2.5rem',
                color: 'white',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        background: 'var(--primary)',
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
                    }}>
                        <LogIn size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>歡迎回來</h1>
                    <p style={{ color: 'var(--text-muted)' }}>請登錄您的管理帳戶</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="帳號 / 電子郵件"
                            style={{ width: '100%', paddingLeft: '2.75rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem', padding: '0.75rem 0.75rem 0.75rem 2.75rem', color: 'white' }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="password"
                            placeholder="密碼"
                            style={{ width: '100%', paddingLeft: '2.75rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem', padding: '0.75rem 0.75rem 0.75rem 2.75rem', color: 'white' }}
                        />
                    </div>
                    <button type="submit" style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '0.875rem',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                    }}>
                        立即登錄 <ArrowRight size={18} />
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>忘記密碼？</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
