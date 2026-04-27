'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Package } from 'lucide-react'
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
      className="bg-card text-card-foreground rounded-xl border border-border overflow-hidden hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 hover:border-primary/25 transition-all duration-300 cursor-pointer group"
    >
      {/* Imagen */}
      <div className="relative h-56 bg-muted overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
            <Package className="h-12 w-12" />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center">
            <Badge variant="destructive" className="font-semibold">Sin stock</Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {product.category && (
          <Badge variant="secondary" className="mb-2 text-xs font-medium px-2 py-0.5">
            {product.category.name}
          </Badge>
        )}

        <h3 className="font-semibold text-foreground mb-1 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="font-bold text-lg text-primary tracking-tight">
            {formattedPrice}
          </span>

          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label={`Agregar ${product.name} al carrito`}
            className="font-medium gap-1.5"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Agregar
          </Button>
        </div>
      </div>
    </div>
  )
}
