'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/useCart'
import { toast } from 'sonner'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const addItem = useCart((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (product.stock === 0) {
      toast.error('Producto sin stock')
      return
    }

    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? null,
      quantity: 1,
    })

    toast.success(`${product.name} agregado al carrito`)
  }

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(product.price)

  return (
    <div
      onClick={() => router.push(`/products/${product.id}`)}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Imagen */}
      <div className="relative h-48 bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">📦</span>
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive">Sin stock</Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {product.category && (
          <Badge variant="secondary" className="mb-2 text-xs">
            {product.category.name}
          </Badge>
        )}

        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-lg text-gray-900">
            {formattedPrice}
          </span>

          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>
      </div>
    </div>
  )
}