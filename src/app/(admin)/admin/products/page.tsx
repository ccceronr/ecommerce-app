import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Package } from 'lucide-react'
import DeleteProductButton from '@/components/admin/DeleteProductButton'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .order('created_at', { ascending: false })

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground mt-1">
            {products?.length || 0} {products?.length === 1 ? 'producto' : 'productos'} en total
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2 font-medium">
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {products && products.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Producto</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Categoría</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Precio</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-foreground">{product.name}</p>
                    <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                      {product.description}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {product.category?.name || '—'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-foreground">
                    {formattedPrice(product.price)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${product.stock === 0 ? 'text-destructive' : 'text-foreground'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={product.active ? 'default' : 'secondary'}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Pencil className="h-3 w-3" />
                          Editar
                        </Button>
                      </Link>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-4">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground mb-1">Sin productos</p>
            <p className="text-muted-foreground text-sm mb-4">Crea el primer producto de tu tienda</p>
            <Link href="/admin/products/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Crear producto
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
