'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'

const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre es demasiado largo'),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryManagerProps {
  initialCategories: Category[]
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  })

  // Generar slug desde el nombre
  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const handleCreate = async (data: CategoryFormData) => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const slug = generateSlug(data.name)

      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({ name: data.name, slug })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          toast.error('Ya existe una categoría con ese nombre')
          return
        }
        throw error
      }

      setCategories((prev) => [...prev, newCategory])
      reset()
      toast.success('Categoría creada correctamente')
      router.refresh()
    } catch {
      toast.error('Error al crear la categoría')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (id: string) => {
    if (!editingName.trim()) {
      toast.error('El nombre no puede estar vacío')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const slug = generateSlug(editingName)

      const { error } = await supabase
        .from('categories')
        .update({ name: editingName, slug })
        .eq('id', id)

      if (error) throw error

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, name: editingName, slug } : cat
        )
      )
      setEditingId(null)
      toast.success('Categoría actualizada')
      router.refresh()
    } catch {
      toast.error('Error al actualizar la categoría')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', deleteId)

      if (error) throw error

      setCategories((prev) => prev.filter((cat) => cat.id !== deleteId))
      setDeleteOpen(false)
      setDeleteId(null)
      toast.success('Categoría eliminada')
      router.refresh()
    } catch {
      toast.error('Error al eliminar la categoría')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Formulario de nueva categoría */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Nueva categoría</h2>
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Ej: Electrónica"
              disabled={isLoading}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            {isLoading ? 'Creando...' : 'Crear categoría'}
          </Button>
        </form>
      </div>

      {/* Lista de categorías */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Categorías existentes
        </h2>

        {categories.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay categorías aún</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                {editingId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-8 text-sm"
                      disabled={isLoading}
                      autoFocus
                    />
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(cat.id)}
                      disabled={isLoading}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => setEditingId(null)}
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-500">{cat.slug}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingId(cat.id)
                          setEditingName(cat.name)
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Dialog open={deleteOpen && deleteId === cat.id} onOpenChange={(open) => {
                        setDeleteOpen(open)
                        if (!open) setDeleteId(null)
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => {
                              setDeleteId(cat.id)
                              setDeleteOpen(true)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>¿Eliminar categoría?</DialogTitle>
                            <DialogDescription>
                              Estás a punto de eliminar <strong>{cat.name}</strong>. Los productos de esta categoría quedarán sin categoría.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                              Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                              {isLoading ? 'Eliminando...' : 'Eliminar'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}