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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Edit,
  Layers,
  Trash2,
  UserPlus,
  Search,
  Check,
} from "lucide-react"
import { apiClient as client, type Event, type Club, type Member } from "@/lib/sdk/api-client"
import { toast } from "sonner"

type EventWithClub = Event & { club?: Pick<Club, 'id' | 'name'> }
type Participant = Pick<Member, 'id' | 'name' | 'lastname'>

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = Number(params.id)

  const [event, setEvent] = useState<EventWithClub | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDatetime, setEditDatetime] = useState("")
  const [editLocation, setEditLocation] = useState("")
  const [editMaxParticipants, setEditMaxParticipants] = useState("")
  const [saving, setSaving] = useState(false)

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {})
  const [confirmMessage, setConfirmMessage] = useState("")

  function openConfirm(message: string, action: () => void) {
    setConfirmMessage(message)
    setConfirmAction(() => action)
    setConfirmOpen(true)
  }

  // Add participant dialog
  const [addOpen, setAddOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => { loadData() }, [eventId])

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await client.members.search({ q: searchQuery, limit: 5 })
        const existingIds = participants.map(p => p.id)
        setSearchResults((res.data as Member[]).filter(m => !existingIds.includes(m.id)))
      } finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery, participants])

  async function loadData() {
    try {
      const [eventData, participantsData] = await Promise.all([
        client.events.getById({ id: eventId }),
        client.events.getParticipants({ id: eventId }),
      ])
      setEvent(eventData.data)
      setParticipants(participantsData.data)
    } finally { setLoading(false) }
  }

  function openEdit() {
    if (!event) return
    setEditName(event.name)
    setEditDescription(event.description ?? "")
    setEditLocation(event.location ?? "")
    setEditMaxParticipants(String(event.max_participants))
    setEditDatetime(new Date(event.datetime).toISOString().slice(0, 16))
    setEditOpen(true)
  }

  async function handleEdit() {
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
    openConfirm(`¿Eliminar el evento "${event?.name}"?`, async () => {
      try {
        await client.events.delete({ id: eventId })
        toast.success("Evento eliminado")
        router.push("/events")
      } catch { toast.error("Error al eliminar") }
    })
  }

  async function handleAddParticipant() {
    if (!selectedMember) return
    setAdding(true)
    try {
      await client.events.addParticipant({ id: eventId, id_member: selectedMember.id })
      toast.success("Participante agregado")
      resetAddModal()
      loadData()
    } catch (err: any) {
      if (err.code === 'EVENT_FULL') toast.error("El evento está lleno")
      else if (err.code === 'MEMBER_ALREADY_ASSIGNED') toast.error("El miembro ya está registrado")
      else toast.error("Error al agregar participante")
    } finally { setAdding(false) }
  }

  async function handleRemoveParticipant(memberId: number) {
    openConfirm("¿Remover este participante del evento?", async () => {
      try {
        await client.events.removeParticipant({ id: eventId, memberId })
        toast.success("Participante removido")
        loadData()
      } catch { toast.error("Error al remover") }
    })
  }

  function resetAddModal() {
    setAddOpen(false)
    setSearchQuery("")
    setSearchResults([])
    setSelectedMember(null)
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
  const currentParticipants = participants.length
  const capacityPercentage = Math.min((currentParticipants / event.max_participants) * 100, 100)
  const isFull = currentParticipants >= event.max_participants
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
          <Edit className="mr-2 h-4 w-4" />Editar
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />Eliminar
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

      {/* Participants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Participantes ({currentParticipants})</CardTitle>
          <Button
            onClick={() => setAddOpen(true)}
            disabled={isFull}
            className="bg-[#0D5E32] text-white hover:bg-[#0D5E32]/90"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {isFull ? 'Evento lleno' : 'Agregar participante'}
          </Button>
        </CardHeader>
        <CardContent>
          {participants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead className="w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.lastname}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveParticipant(p.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No hay participantes registrados.</p>
          )}
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

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar acción</DialogTitle>
            <DialogDescription>{confirmMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => { setConfirmOpen(false); confirmAction() }}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar Evento</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Nombre</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} /></div>
            <div className="space-y-2"><Label>Fecha y hora</Label><Input type="datetime-local" value={editDatetime} onChange={(e) => setEditDatetime(e.target.value)} /></div>
            <div className="space-y-2"><Label>Ubicación</Label><Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} /></div>
            <div className="space-y-2"><Label>Capacidad máxima</Label><Input type="number" min="1" value={editMaxParticipants} onChange={(e) => setEditMaxParticipants(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={saving} className="bg-[#0D5E32] text-white hover:bg-[#0D5E32]/90">{saving ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add participant dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar participante</DialogTitle>
            <DialogDescription>Busca un miembro para registrarlo en el evento</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedMember(null) }}
                className="pl-10"
              />
            </div>
            {searching && <p className="text-sm text-muted-foreground text-center">Buscando...</p>}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedMember?.id === m.id ? 'border-[#0D5E32] bg-[#0D5E32]/5' : 'border-border hover:bg-muted/50'}`}
                  >
                    <p className="font-medium">{m.name} {m.lastname}</p>
                    {selectedMember?.id === m.id && <Check className="h-5 w-5 text-[#0D5E32]" />}
                  </div>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">No se encontraron miembros</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetAddModal}>Cancelar</Button>
            <Button onClick={handleAddParticipant} disabled={!selectedMember || adding} className="bg-[#0D5E32] text-white hover:bg-[#0D5E32]/90">
              {adding ? 'Agregando...' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
