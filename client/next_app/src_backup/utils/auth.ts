
import { useState } from 'react';

/**
 * 簡易的登入狀態管理
 */
export const useAuth = () => {
    // 取得資料時增加錯誤檢查
    const getSession = () => {
        try {
            const session = localStorage.getItem('admin_session');
            if (!session) return null;
            return JSON.parse(session);
        } catch (e) {
            console.error("Session parse error", e);
            return null;
        }
    };

    const [manager, setManager] = useState<any>(() => getSession());
    const isLoggedIn = !!manager;

    const login = (adminData: any) => {
        const sessionData = {
            uid: adminData.uid,
            account: adminData.account,
            website_name: adminData.website_name,
            logo_url: adminData.logo_url,
            timestamp: Date.now()
        };
        localStorage.setItem('admin_session', JSON.stringify(sessionData));
        setManager(sessionData);
    };

    const logout = () => {
        localStorage.removeItem('admin_session');
        setManager(null);
        window.location.href = '/';
    };

    return { isLoggedIn, manager, login, logout };
};
