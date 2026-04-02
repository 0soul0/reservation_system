import { getAllManagers } from '@/app/actions/superManagers'
import { getSession } from '@/app/actions/superAuth'
import { MANAGER_LEVEL } from '@/constants/common'
import { ROUTES } from '@/constants/routes'
import { redirect } from 'next/navigation'
import SuperAdminClient from './SuperAdminClient'

export default async function SuperAdminPage() {
  const session = await getSession(MANAGER_LEVEL.SUPER)
  
  if (!session) {
    redirect(ROUTES.SUPER_ADMIN.LOGIN)
  }

  const managers = await getAllManagers()

  return <SuperAdminClient initialManagers={managers} />
}
