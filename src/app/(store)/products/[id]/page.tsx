import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import AddToCartButton from '@/components/store/AddToCartButton'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (!product) notFound()

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(product.price)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Imágenes */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="h-full flex items-center justify-center text-6xl">
                📦
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img: string, index: number) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-100 rounded-md overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info del producto */}
        <div className="space-y-6">
          {product.category && (
            <Badge variant="secondary">{product.category.name}</Badge>
          )}

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-gray-900">
              {formattedPrice}
            </p>
          </div>

          <Separator />

          {product.description && (
            <div>
              <h2 className="font-medium text-gray-900 mb-2">Descripción</h2>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Disponibilidad:</span>
              {product.stock > 0 ? (
                <span className="text-sm text-green-600 font-medium">
                  En stock ({product.stock} disponibles)
                </span>
              ) : (
                <span className="text-sm text-red-500 font-medium">Sin stock</span>
              )}
            </div>
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}