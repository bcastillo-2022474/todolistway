"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Layers,
  Users,
  Search,
  Plus,
  MapPin,
  Clock
} from "lucide-react"
import { client, type Club } from "@/lib/sdk/client"
import { toast } from "sonner"

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Create dialog
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [schedule, setSchedule] = useState("")
  const [location, setLocation] = useState("")

  useEffect(() => {
    loadClubs()
  }, [search])

  async function loadClubs() {
    try {
      const response = await client.clubs.list({ search, limit: 20 })
      setClubs(response.data)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setName(""); setDescription(""); setSchedule(""); setLocation("")
    setOpen(true)
  }

  async function handleCreate() {
    if (!name.trim() || !description.trim() || !schedule.trim() || !location.trim()) return
    setSaving(true)
    try {
      await client.clubs.create({ name: name.trim(), description: description.trim(), schedule: schedule.trim(), location: location.trim() })
      toast.success("Club creado")
      setOpen(false)
      loadClubs()
    } catch {
      toast.error("Error al crear el club")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clubes</h1>
          <p className="text-muted-foreground mt-1">Gestiona los clubes y sus miembros</p>
        </div>
        <Button onClick={openCreate} className="bg-[#0D5E32] text-white hover:bg-[#0D5E32]/90">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Club
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar clubes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[30vh]">
          <div className="animate-pulse text-muted-foreground">Cargando clubes...</div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <Link key={club.id} href={`/clubs/${club.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-[#0D5E32]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0D5E32]">
                      <Layers className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{club.member_count ?? 0}</span>
                    </div>
                  </div>
                  <CardTitle className="mt-4">{club.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{club.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-[#3D9942]" />
                      <span>{club.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-[#3D9942]" />
                      <span>{club.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!loading && clubs.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[30vh] text-center">
          <Layers className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No se encontraron clubes</h3>
          <p className="text-muted-foreground">Intenta con otra búsqueda o crea un nuevo club</p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Club</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Club de Robótica" />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción del club" />
            </div>
            <div className="space-y-2">
              <Label>Horario</Label>
              <Input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="Martes y Jueves 15:00-17:00" />
            </div>
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Edificio de Ingeniería, Lab 201" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !name.trim() || !description.trim() || !schedule.trim() || !location.trim()}
              className="bg-[#0D5E32] text-white hover:bg-[#0D5E32]/90"
            >
              {saving ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
