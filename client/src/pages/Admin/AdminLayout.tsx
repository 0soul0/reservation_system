import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { Users, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../utils/auth';
import { useState } from 'react';

const AdminLayout: React.FC = () => {
    const { isLoggedIn, manager, logout } = useAuth();
    const [logoError, setLogoError] = useState(false);

    // Debug 用的 Log
    console.log("Current Manager Session:", manager);

    if (!isLoggedIn) {
        return <Navigate to="/" replace />;
    }
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
                                src={`/logo/${manager?.logo_url}`}
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

                <NavLink to="/admin/members" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <Users size={20} />
                    <span>會員管理</span>
                </NavLink>

                <NavLink to="/admin/schedule_time" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <Calendar size={20} />
                    <span>排程時間</span>
                </NavLink>

                <NavLink to="/admin/event" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <Settings size={20} />
                    <span>活動設定</span>
                </NavLink>

                <NavLink to="/admin/bookings" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <Calendar size={20} />
                    <span>預約管理</span>
                </NavLink>



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
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
