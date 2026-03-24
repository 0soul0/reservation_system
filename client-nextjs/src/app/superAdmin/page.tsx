'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus, Search, Edit3, Trash2, Shield, User,
  Loader2, Globe, Settings
} from 'lucide-react'
import { getAllManagers, deleteManager } from '@/app/actions/superManagers'
import { getSuperSession, superLogoutAction } from '@/app/actions/superAuth'



// ─── 主頁面 ────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const [managers, setManagers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function checkSession() {
      const session = await getSuperSession()
      if (!session) { router.push('/superAdmin/login'); return }
      loadManagers()
    }
    checkSession()
  }, [])

  const loadManagers = async () => {
    setLoading(true)
    const data = await getAllManagers()
    setManagers(data)
    setLoading(false)
  }

  const filteredManagers = managers.filter(m =>
    m.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    m.account?.toLowerCase().includes(searchValue.toLowerCase()) ||
    m.website_name?.toLowerCase().includes(searchValue.toLowerCase())
  )


  const handleDelete = async (uid: string) => {
    if (!confirm('確定要刪除此管理員嗎？')) return
    const res = await deleteManager(uid)
    if (res.success) loadManagers()
    else alert(res.message || '刪除失敗')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 font-sans selection:bg-purple-500/30">
      <div className="fixed top-0 right-0 w-[40vw] h-[40vw] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[40vw] h-[40vw] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-xl shadow-purple-500/20 ring-2 ring-white/5">
            <Shield className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter italic uppercase">
              Triple <span className="text-purple-500">Super</span> Dashboard
            </h1>
            <p className="text-slate-300 text-sm font-bold tracking-[0.3em] uppercase opacity-70">System Management Authority</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => { await superLogoutAction(); router.push('/superAdmin/login') }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 transition-all active:scale-95 text-slate-400"
          >
            登出
          </button>
          <button
            onClick={() => router.push('/superAdmin/new/edit')}
            className="px-5 py-2.5 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-500/30"
          >
            <UserPlus size={14} /> 建立管理員
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto relative z-10">
        {/* Search */}
        <div className="mb-6 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" size={16} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="搜尋管理員姓名、帳號或網站名稱..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-purple-500/40 focus:bg-white/[0.05] transition-all placeholder-slate-600"
          />
        </div>

        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-4 opacity-30">
            <Loader2 className="animate-spin text-purple-500" size={48} strokeWidth={1} />
            <p className="text-xs font-black tracking-widest uppercase">載入中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredManagers.map((manager, idx) => (
                <motion.div
                  key={manager.uid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="group relative bg-white/[0.02] border border-white/10 rounded-3xl p-6 hover:bg-white/[0.04] hover:border-purple-500/30 transition-all duration-500 shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600/10 to-transparent border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center p-3">
                      {manager.logo_url ? (
                        <img src={manager.logo_url} alt={manager.name} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <User size={24} className="text-slate-700" />
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => router.push(`/superAdmin/${manager.uid}/edit`)} className="p-2 bg-white/5 rounded-xl hover:bg-purple-600 hover:text-white transition-all text-slate-400">
                        <Edit3 size={15} />
                      </button>
                      {manager.level == 0 && (
                        <button onClick={() => handleDelete(manager.uid)} className="p-2 bg-white/5 rounded-xl hover:bg-rose-600 hover:text-white transition-all text-slate-400">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 space-y-4">
                    <div>
                      <h2 className="text-lg font-black text-white italic tracking-tight">{manager.name}</h2>
                      <p className="text-slate-300 font-mono text-sm uppercase tracking-widest mt-0.5">@{manager.account}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 py-3 px-4 bg-white/[0.03] border border-white/5 rounded-xl">
                        <Globe size={14} className="text-cyan-500 shrink-0" />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm text-slate-300 uppercase font-bold tracking-widest">網站識別碼</p>
                          <p className="text-xs font-bold text-slate-300 truncate">{manager.website_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-3 px-4 bg-white/[0.03] border border-white/5 rounded-xl">
                        <Settings size={14} className="text-purple-500 shrink-0" />
                        <div>
                          <p className="text-sm text-slate-300 uppercase font-bold tracking-widest">問卷題目數</p>
                          <p className="text-xs font-bold text-slate-300">
                            {(() => {
                              try {
                                const raw = manager.questionnaire
                                const q = typeof raw === 'string' ? JSON.parse(raw || '[]') : (Array.isArray(raw) ? raw : [])
                                return q.length
                              } catch { return 0 }
                            })()} 題
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

    </div>
  )
}
