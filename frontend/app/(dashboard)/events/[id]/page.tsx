"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Edit,
  Layers,
  Trash2,
} from "lucide-react"
import { apiClient as client, type Event, type Club } from "@/lib/sdk/api-client"
import { toast } from "sonner"

type EventWithClub = Event & { club?: Pick<Club, 'id' | 'name'> }

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = Number(params.id)

  const [event, setEvent] = useState<EventWithClub | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDatetime, setEditDatetime] = useState("")
  const [editLocation, setEditLocation] = useState("")
  const [editMaxParticipants, setEditMaxParticipants] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [eventId])

  async function loadData() {
    try {
      const eventData = await client.events.getById({ id: eventId })
      setEvent(eventData.data)
    } finally {
      setLoading(false)
    }
  }

  function openEdit() {
    if (!event) return
    setEditName(event.name)
    setEditDescription(event.description)
    setEditLocation(event.location)
    setEditMaxParticipants(String(event.max_participants))
    // Convert ISO to datetime-local format (YYYY-MM-DDTHH:MM)
    setEditDatetime(new Date(event.datetime).toISOString().slice(0, 16))
    setEditOpen(true)
  }

  async function handleEdit() {
    if (!event) return
    setSaving(true)
    try {
      await client.events.update({
        id: eventId,
        data: {
          name: editName.trim(),
          description: editDescription.trim(),
          datetime: new Date(editDatetime).toISOString(),
          location: editLocation.trim(),
          max_participants: Number(editMaxParticipants),
        }
      })
      toast.success("Evento actualizado")
      setEditOpen(false)
      loadData()
    } catch { toast.error("Error al actualizar") } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar el evento "${event?.name}"? Esta acción no se puede deshacer.`)) return
    try {
      await client.events.delete({ id: eventId })
      toast.success("Evento eliminado")
      router.push("/events")
    } catch { toast.error("Error al eliminar el evento") }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[50vh]"><div className="animate-pulse text-muted-foreground">Cargando evento...</div></div>
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-medium">Evento no encontrado</h2>
        <Link href="/events"><Button variant="link">Volver a eventos</Button></Link>
      </div>
    )
  }

  const isUpcoming = new Date(event.datetime) > new Date()
  const currentParticipants = event.current_participants ?? 0
  const capacityPercentage = (currentParticipants / event.max_participants) * 100
  const eventDate = new Date(event.datetime)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{event.name}</h1>
            <Badge className={isUpcoming ? 'bg-[#3D9942] text-white' : 'bg-muted text-muted-foreground'}>
              {isUpcoming ? 'Próximo' : 'Finalizado'}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{event.description}</p>
        </div>
        <Button variant="outline" onClick={openEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#0D5E32] border-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-sm font-bold text-white">{eventDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-xs text-white/70">Fecha</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#3D9942] border-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-lg font-bold text-white">{eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-xs text-white/70">Hora</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#5BB563] border-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-white/70" />
              <div>
                <p className="text-sm font-bold text-white">{event.location}</p>
                <p className="text-xs text-white/70">Ubicación</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-[#0D5E32]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[#3D9942]" />
              <div>
                <p className="text-lg font-bold text-[#0D5E32]">{currentParticipants}/{event.max_participants}</p>
                <p className="text-xs text-[#3D9942]">Participantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Capacidad del Evento</span>
            <span className="text-sm font-normal text-muted-foreground">{event.max_participants - currentParticipants} lugares disponibles</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={capacityPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">{capacityPercentage.toFixed(0)}% de la capacidad</p>
        </CardContent>
      </Card>

      {/* Club */}
      {event.club && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" />Club Organizador</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/clubs/${event.club.id}`} className="flex items-center gap-4 p-4 rounded-lg border border-[#0D5E32]/20 hover:bg-muted/50 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#3D9942]">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#0D5E32]">{event.club.name}</p>
                <p className="text-sm text-muted-foreground">Ver detalles del club</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fecha y hora</Label>
              <Input type="datetime-local" value={editDatetime} onChange={(e) => setEditDatetime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Capacidad máxima</Label>
              <Input type="number" min="1" value={editMaxParticipants} onChange={(e) => setEditMaxParticipants(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={saving} className="bg-[#0D5E32] text-white hover:bg-[#0D5E32]/90">
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
