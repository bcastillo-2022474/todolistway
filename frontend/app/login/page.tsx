'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiClient, setToken } from '@/lib/sdk/api-client'
import { saveToken } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(false)
    setLoading(true)
    try {
      const res = await apiClient.admin.login({ password })
      saveToken(res.data.token)
      setToken(res.data.token)
      router.push('/clubs')
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D5E32]">
              <span className="text-white font-bold text-lg">C</span>
            </div>
          </div>
          <CardTitle className="text-2xl">ClubHub UVG</CardTitle>
          <CardDescription>Ingresa la contraseña de administrador</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">Contraseña incorrecta</p>
            )}
            <Button
              type="submit"
              className="w-full bg-[#0D5E32] hover:bg-[#0D5E32]/90 text-white"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
