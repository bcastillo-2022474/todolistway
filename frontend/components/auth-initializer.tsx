'use client'

import { useEffect } from 'react'
import { getToken } from '@/lib/auth'
import { setToken } from '@/lib/sdk/api-client'

export function AuthInitializer() {
  useEffect(() => {
    setToken(getToken())
  }, [])
  return null
}
