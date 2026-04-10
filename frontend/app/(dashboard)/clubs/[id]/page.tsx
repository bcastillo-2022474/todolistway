"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  MapPin, 
  Clock, 
  UserPlus,
  Search,
  Trash2,
  Check
} from "lucide-react"
import { client, type Club, type ClubMember, type Member } from "@/lib/sdk/client"

export default function ClubDetailPage() {
  const params = useParams()
  const clubId = Number(params.id)
  
  const [club, setClub] = useState<Club | null>(null)
  const [members, setMembers] = useState<(ClubMember & { member: Member })[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  
  // New member form
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberLastname, setNewMemberLastname] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadData()
  }, [clubId])

  async function loadData() {
    try {
      const [clubData, membersData] = await Promise.all([
        client.clubs.getById({ id: clubId }),
        client.clubs.getMembers({ id: clubId })
      ])
      setClub(clubData.data)
      setMembers(membersData.data)
    } finally {
      setLoading(false)
    }
  }

  // Search members
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    
    const searchMembers = async () => {
      setSearching(true)
      try {
        const response = await client.members.search({ q: searchQuery, limit: 5 })
        // Filter out members already in the club
        const existingIds = members.map(m => m.id_member)
        setSearchResults(response.data.filter(m => !existingIds.includes(m.id)))
      } finally {
        setSearching(false)
      }
    }
    
    const debounce = setTimeout(searchMembers, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, members])

  async function handleAssignMember() {
    if (!selectedMember) return
    
    setIsCreating(true)
    try {
      await client.clubs.assignMember({ clubId, memberId: selectedMember.id })
      await loadData()
      resetModal()
    } finally {
      setIsCreating(false)
    }
  }

  async function handleCreateAndAssign() {
    if (!newMemberName.trim() || !newMemberLastname.trim()) return
    
    setIsCreating(true)
    try {
      await client.clubs.createAndAssignMember({ 
        clubId, 
        name: newMemberName.trim(), 
        lastname: newMemberLastname.trim() 
      })
      await loadData()
      resetModal()
    } finally {
      setIsCreating(false)
    }
  }

  async function handleRemoveMember(memberId: number) {
    if (!confirm("¿Estás seguro de remover este miembro del club?")) return
    
    try {
      await client.clubs.removeMember({ clubId, memberId })
      await loadData()
    } catch (error) {
      console.error("Error removing member:", error)
    }
  }

  function resetModal() {
    setIsModalOpen(false)
    setSearchQuery("")
    setSearchResults([])
    setSelectedMember(null)
    setNewMemberName("")
    setNewMemberLastname("")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Cargando club...</div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-medium">Club no encontrado</h2>
        <Link href="/clubs">
          <Button variant="link">Volver a clubes</Button>
        </Link>
      </div>
    )
  }

  const showCreateForm = searchQuery.length >= 2 && searchResults.length === 0 && !searching

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/clubs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{club.name}</h1>
          <p className="text-muted-foreground mt-1">{club.description}</p>
        </div>
      </div>

      {/* Club Info Card */}
      <Card className="border-l-4 border-l-[#0D5E32]">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0D5E32]">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horario</p>
                <p className="font-medium">{club.schedule}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3D9942]">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ubicación</p>
                <p className="font-medium">{club.location}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Miembros ({members.length})</CardTitle>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0D5E32] text-white hover:bg-[#0D5E32]/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Agregar miembro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Agregar miembro al club</DialogTitle>
                <DialogDescription>
                  Busca un miembro existente o crea uno nuevo
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setSelectedMember(null)
                    }}
                    className="pl-10"
                  />
                </div>

                {/* Search Results */}
                {searching && (
                  <p className="text-sm text-muted-foreground text-center py-2">Buscando...</p>
                )}
                
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Resultados:</p>
                    {searchResults.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedMember?.id === member.id 
                            ? 'border-[#0D5E32] bg-[#0D5E32]/5' 
                            : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{member.name} {member.lastname}</p>
                          <p className="text-sm text-muted-foreground">
                            Registrado: {new Date(member.created_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        {selectedMember?.id === member.id && (
                          <Check className="h-5 w-5 text-[#0D5E32]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Create New Member Form */}
                {showCreateForm && (
                  <div className="space-y-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      No se encontró ningún miembro. Crea uno nuevo:
                    </p>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                          id="name"
                          placeholder="Nombre"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastname">Apellido</Label>
                        <Input
                          id="lastname"
                          placeholder="Apellido"
                          value={newMemberLastname}
                          onChange={(e) => setNewMemberLastname(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetModal}>
                  Cancelar
                </Button>
                {selectedMember ? (
                  <Button 
                    onClick={handleAssignMember} 
                    disabled={isCreating}
                    className="bg-[#0D5E32] text-white hover:bg-[#0D5E32]/90"
                  >
                    {isCreating ? 'Asignando...' : 'Asignar miembro'}
                  </Button>
                ) : showCreateForm && (
                  <Button 
                    onClick={handleCreateAndAssign} 
                    disabled={isCreating || !newMemberName.trim() || !newMemberLastname.trim()}
                    className="bg-[#0D5E32] text-white hover:bg-[#0D5E32]/90"
                  >
                    {isCreating ? 'Creando...' : 'Crear y asignar'}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Fecha de asignación</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((assignment) => (
                  <TableRow key={assignment.id_member}>
                    <TableCell className="font-medium">{assignment.member.name}</TableCell>
                    <TableCell>{assignment.member.lastname}</TableCell>
                    <TableCell>
                      {new Date(assignment.date_assign).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(assignment.id_member)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay miembros en este club. Agrega el primero.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
