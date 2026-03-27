import { getAuthSession } from '@/services/auth'
import { redirect } from 'next/navigation'
import LoginClient from './LoginClient'
import { ROUTES } from '@/constants/routes'

export default async function LoginPage() {
  const session = await getAuthSession()

  // 如果已經登入，直接跳轉到成員列表
  if (session) {
    redirect(ROUTES.ADMIN.HOME)
  }

  return <LoginClient />
}
