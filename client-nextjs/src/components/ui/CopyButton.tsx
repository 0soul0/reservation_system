"use client";

import { useState } from 'react';
import { Link, Check, Copy } from 'lucide-react';

export default function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (typeof window === 'undefined') return;

        try {
            // 關鍵修正：優先複製傳入的 text，如果 text 為空才複製當前網址
            const contentToCopy = text || window.location.href;

            await navigator.clipboard.writeText(contentToCopy);
            setCopied(true);

            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('無法複製內容:', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
                ${copied
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
                }`}
        >
            {/* 圖示隨狀態切換 */}
            {copied ? <Check size={18} /> : <Copy size={18} />}

            <span className="text-sm font-medium">
                {copied ? '已複製連接' : 'Line Webhook 連接'}
            </span>
        </button>
    );
}