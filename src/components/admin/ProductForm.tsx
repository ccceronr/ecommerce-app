'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { productSchema, type ProductFormData } from '@/lib/validations/product'
import type { Category, Product } from '@/types'
import { Trash2, Upload } from 'lucide-react'

interface ProductFormProps {
  categories: Category[]
  product?: Product
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [uploadingImage, setUploadingImage] = useState(false)
  const isEditing = !!product

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category_id: product?.category_id || '',
      stock: product?.stock || 0,
      active: product?.active ?? true,
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes JPG, PNG o WebP')
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB')
      return
    }

    setUploadingImage(true)
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)

      setImages((prev) => [...prev, publicUrl])
      toast.success('Imagen subida correctamente')
    } catch {
      toast.error('Error al subir la imagen')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = async (url: string) => {
    try {
      const supabase = createClient()
      const fileName = url.split('/').pop()
      if (fileName) {
        await supabase.storage.from('products').remove([fileName])
      }
      setImages((prev) => prev.filter((img) => img !== url))
      toast.success('Imagen eliminada')
    } catch {
      toast.error('Error al eliminar la imagen')
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      const productData = {
        ...data,
        images,
      }

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)

        if (error) throw error
        toast.success('Producto actualizado correctamente')
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData)

        if (error) throw error
        toast.success('Producto creado correctamente')
      }

      router.push('/admin/products')
      router.refresh()
    } catch {
      toast.error('Error al guardar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del producto</Label>
            <Input
              id="name"
              placeholder="Ej: Audífonos Bluetooth"
              disabled={isLoading}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el producto..."
              rows={4}
              disabled={isLoading}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (COP)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0"
                min="0"
                disabled={isLoading}
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                min="0"
                disabled={isLoading}
                {...register('stock', { valueAsNumber: true })}
              />
              {errors.stock && (
                <p className="text-sm text-red-500">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              defaultValue={product?.category_id || ''}
              onValueChange={(value) => setValue('category_id', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-red-500">{errors.category_id.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              className="h-4 w-4"
              defaultChecked={product?.active ?? true}
              {...register('active')}
            />
            <Label htmlFor="active">Producto activo (visible en la tienda)</Label>
          </div>
        </div>

        {/* Columna derecha — imágenes */}
        <div className="space-y-4">
          <Label>Imágenes del producto</Label>

          {/* Grid de imágenes */}
          <div className="grid grid-cols-2 gap-3">
            {images.map((url, index) => (
              <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={url}
                  alt={`Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(url)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Eliminar imagen"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Botón de subir imagen */}
            <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
              <Upload className="h-6 w-6 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">
                {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImage || isLoading}
              />
            </label>
          </div>

          <p className="text-xs text-gray-500">
            Formatos: JPG, PNG, WebP. Máximo 5MB por imagen.
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? isEditing ? 'Actualizando...' : 'Creando...'
            : isEditing ? 'Actualizar producto' : 'Crear producto'
          }
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}