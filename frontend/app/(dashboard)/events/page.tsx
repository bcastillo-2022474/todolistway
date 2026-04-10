"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Plus,
  Calendar,
  MapPin,
  Clock,
  Users
} from "lucide-react"
import { client, type Event, type Club } from "@/lib/sdk/client"

type EventWithClub = Event & { club?: Pick<Club, 'id' | 'name'> }

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithClub[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const upcoming = statusFilter === "upcoming" ? true : undefined
        const response = await client.events.list({ search, upcoming, limit: 50 })
        setEvents(response.data)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [search, statusFilter])

  const isUpcoming = (event: EventWithClub) => new Date(event.datetime) > new Date()
  const isPast = (event: EventWithClub) => new Date(event.datetime) <= new Date()

  const filteredEvents = events.filter(e => {
    if (statusFilter === "upcoming") return isUpcoming(e)
    if (statusFilter === "past") return isPast(e)
    return true
  })

  const upcomingCount = events.filter(isUpcoming).length
  const pastCount = events.filter(isPast).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
          <p className="text-muted-foreground mt-1">Gestiona los eventos de todos los clubes</p>
        </div>
        <Button className="bg-[#0D5E32] text-white hover:bg-[#0D5E32]/90">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar eventos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">Todos ({events.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Próximos ({upcomingCount})</TabsTrigger>
          <TabsTrigger value="past">Pasados ({pastCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <EventGrid events={filteredEvents} loading={loading} />
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4">
          <EventGrid events={filteredEvents} loading={loading} />
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <EventGrid events={filteredEvents} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EventGrid({ 
  events, 
  loading
}: { 
  events: EventWithClub[]
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[30vh]">
        <div className="animate-pulse text-muted-foreground">Cargando eventos...</div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[30vh] text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No se encontraron eventos</h3>
        <p className="text-muted-foreground">Intenta con otra búsqueda o crea un nuevo evento</p>
      </div>
    )
  }

  const isUpcoming = (datetime: string) => new Date(datetime) > new Date()

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Link key={event.id} href={`/events/${event.id}`}>
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-[#3D9942]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#5BB563]">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <Badge className={isUpcoming(event.datetime) ? 'bg-[#3D9942] text-white' : 'bg-muted text-muted-foreground'}>
                  {isUpcoming(event.datetime) ? 'Próximo' : 'Finalizado'}
                </Badge>
              </div>
              <CardTitle className="mt-4 line-clamp-1">{event.name}</CardTitle>
              <CardDescription className="line-clamp-2">{event.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-[#3D9942]" />
                  <span>
                    {new Date(event.datetime).toLocaleDateString('es-ES', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-[#3D9942]" />
                  <span>
                    {new Date(event.datetime).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-[#3D9942]" />
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 text-[#3D9942]" />
                  <span>{event.current_participants ?? 0} / {event.max_participants} participantes</span>
                </div>
                {event.club && (
                  <Badge variant="outline" className="mt-2 border-[#0D5E32] text-[#0D5E32]">
                    {event.club.name}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
