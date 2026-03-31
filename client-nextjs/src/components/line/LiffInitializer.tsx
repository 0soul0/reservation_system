'use client'

import { useEffect } from 'react'
import { initLiff, getLiffProfile } from '@/lib/liff'
import { Loader2 } from 'lucide-react'
import { CONFIG_ENV } from '@/lib/env'

/**
 * LIFF 身份初始化組件
 * 當 URL 中缺少 line_uid 時，透過此組件取得 LINE 身分後並重新導向原頁面
 */
export default function LiffInitializer() {

  useEffect(() => {
    const initAndRedirect = async () => {
      const liffId = CONFIG_ENV.liffId || ''
      if (!liffId) return

      localStorage.setItem('line_back_url', window.location.href)

      try {
        await initLiff(liffId)
        const profile = await getLiffProfile()

        if (profile?.userId) {
          const url = new URL(window.location.href)

          // 3. 關鍵：檢查參數是否已存在，避免無限循環
          if (url.searchParams.get('line_uid') !== profile.userId) {
            url.searchParams.set('line_uid', profile.userId)
            window.location.replace(url.toString())
            localStorage.removeItem('line_back_url')
          }
        }
      } catch (err) {
        console.error("取得 LINE Profile 失敗:", err)
      }
    }

    initAndRedirect()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] text-slate-900">
      {/* 背景裝飾：將原本深紫色的發光改為更柔和的淺紫色/藍色暈染 */}
      <div className="relative">
        <div className="absolute inset-0 bg-purple-200/50 blur-[40px] rounded-full" />
        {/* 調整 Loader 顏色，使其在淺色背景下更顯眼 */}
        <Loader2 className="animate-spin mb-6 text-cyan-600 relative z-10" size={48} />
      </div>

      {/* 標題：調整漸層色深一點，確保閱讀清晰度 */}
      <h2 className="text-xl font-black tracking-[0.2em] mb-2 uppercase bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
        Secure Access
      </h2>

      {/* 副標題：將原本的 slate-500 改為稍深的 slate-400/500，在淺色背景更協調 */}
      <p className="font-bold tracking-widest text-slate-400 text-xs sm:text-sm">
        正在完成 LINE 身份安全驗證...
      </p>
    </div>
  )
}
