import React from 'react';
import { Search, UserPlus, Filter, MoreVertical } from 'lucide-react';

const Members: React.FC = () => {
    const members = [
        { id: 1, name: '王小明', email: 'ming@example.com', level: '黃金會員', date: '2025-01-15', status: '活躍' },
        { id: 2, name: '李華', email: 'hua@example.com', level: '普通會員', date: '2025-02-10', status: '活躍' },
        { id: 3, name: '張三', email: 'san@example.com', level: '白金會員', date: '2024-12-05', status: '休眠' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>會員管理</h1>
                    <p style={{ color: '#71717a', fontSize: '1rem' }}>管理系統內的所有註冊會員資料</p>
                </div>
                <button className="primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserPlus size={18} /> 新增會員
                </button>
            </div>

            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input type="text" placeholder="搜尋會員名稱、郵箱..." style={{ width: '100%', paddingLeft: '2.75rem', color: '#1e293b', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                    </div>
                    <button style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={18} /> 篩選
                    </button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>姓名</th>
                            <th>電子郵件</th>
                            <th>會員等級</th>
                            <th>加入日期</th>
                            <th>狀態</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map(member => (
                            <tr key={member.id}>
                                <td style={{ fontWeight: 500 }}>{member.name}</td>
                                <td style={{ color: '#64748b' }}>{member.email}</td>
                                <td>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: member.level === '白金會員' ? '#fef3c7' : member.level === '黃金會員' ? '#f1f5f9' : '#f0f9ff',
                                        color: member.level === '白金會員' ? '#92400e' : member.level === '黃金會員' ? '#1e293b' : '#0369a1'
                                    }}>
                                        {member.level}
                                    </span>
                                </td>
                                <td>{member.date}</td>
                                <td>
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        color: member.status === '活躍' ? '#22c55e' : '#94a3b8'
                                    }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                        {member.status}
                                    </span>
                                </td>
                                <td><MoreVertical size={18} style={{ cursor: 'pointer', color: '#94a3b8' }} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Members;
