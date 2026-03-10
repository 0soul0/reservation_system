import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Users, Calendar, Settings, LogOut } from 'lucide-react';

const AdminLayout: React.FC = () => {
    return (
        <div className="admin-container">
            <div className="sidebar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'var(--primary)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Settings size={22} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>HNP 管理系統</h2>
                </div>

                <NavLink to="/admin/members" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <Users size={20} />
                    <span>會員管理</span>
                </NavLink>

                <NavLink to="/admin/bookings" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <Calendar size={20} />
                    <span>預約管理</span>
                </NavLink>

                <NavLink to="/admin/activity" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <Settings size={20} />
                    <span>活動設定</span>
                </NavLink>

                <NavLink to="/admin/openinghours" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                    <Calendar size={20} />
                    <span>營業時間</span>
                </NavLink>

                <div style={{ marginTop: 'auto' }}>
                    <NavLink to="/" className="sidebar-item" style={{ marginTop: '2rem', color: '#ef4444' }}>
                        <LogOut size={20} />
                        <span>登出系統</span>
                    </NavLink>
                </div>
            </div>

            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
