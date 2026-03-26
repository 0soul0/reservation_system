import { getAuthSession } from '@/services/auth'
import { redirect } from 'next/navigation'
import DashboardNav from './DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAuthSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar (Responsive) */}
      <DashboardNav session={{ name: session.name || 'Admin', account: session.account || 'admin' }} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[url('/login-bg.png')] bg-cover bg-fixed bg-center">
        <div className="min-h-full backdrop-blur-3xl bg-black/80 px-4 py-8 sm:p-6 md:p-10">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
