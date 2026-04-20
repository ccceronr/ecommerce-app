'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { toast } from 'sonner'
import type { Product } from '@/types'

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCart((state) => state.addItem)

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('Producto sin stock')
      return
    }

    if (quantity > product.stock) {
      toast.error(`Solo hay ${product.stock} unidades disponibles`)
      return
    }

    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? null,
      quantity,
    })

    toast.success(`${product.name} agregado al carrito`)
  }

  return (
    <div className="space-y-4">
      {/* Selector de cantidad */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Cantidad:</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || product.stock === 0}
            aria-label="Disminuir cantidad"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            disabled={quantity >= product.stock || product.stock === 0}
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Botón agregar al carrito */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleAddToCart}
        disabled={product.stock === 0}
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
      </Button>
    </div>
  )
}