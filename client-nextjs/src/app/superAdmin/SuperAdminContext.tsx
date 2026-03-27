'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { LineNotifyProcedure } from '@/types'
import { getNotifyProcedures } from '@/app/actions/superManagers'

type SuperAdminContextType = {
  notifyProcedures: LineNotifyProcedure[]
  loading: boolean
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined)

export function SuperAdminProvider({ children }: { children: React.ReactNode }) {
  const [notifyProcedures, setNotifyProcedures] = useState<LineNotifyProcedure[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProcedures() {
      const data = await getNotifyProcedures()
      setNotifyProcedures(data)
      setLoading(false)
    }
    fetchProcedures()
  }, [])

  return (
    <SuperAdminContext.Provider value={{ notifyProcedures, loading }}>
      {children}
    </SuperAdminContext.Provider>
  )
}

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext)
  if (context === undefined) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider')
  }
  return context
}
