import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
      {/* Breadcrumb / Volver */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a productos
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Imágenes */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden border border-border">
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
              <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground/40">
                <Package className="h-16 w-16" />
                <span className="text-sm">Sin imagen</span>
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img: string, index: number) => (
                <div
                  key={index}
                  className="relative aspect-square bg-muted rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-colors"
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
        <div className="space-y-5">
          {product.category && (
            <Badge variant="secondary" className="font-medium">
              {product.category.name}
            </Badge>
          )}

          <div>
            <h1 className="text-3xl font-bold text-foreground mb-3 leading-tight">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-primary tracking-tight">
              {formattedPrice}
            </p>
          </div>

          <Separator />

          {product.description && (
            <div>
              <h2 className="font-semibold text-foreground mb-2">Descripción</h2>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="flex items-center gap-2 py-1">
            <span className="text-sm text-muted-foreground">Disponibilidad:</span>
            {product.stock > 0 ? (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                En stock ({product.stock} disponibles)
              </span>
            ) : (
              <span className="text-sm text-destructive font-medium">Sin stock</span>
            )}
          </div>

          <div className="pt-2">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}
