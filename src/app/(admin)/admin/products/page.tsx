import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Pencil } from 'lucide-react'
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
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">{products?.length || 0} productos en total</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo producto
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Producto</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Categoría</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Precio</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Stock</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Estado</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                    {product.description}
                  </p>
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {product.category?.name || '—'}
                </td>
                <td className="py-3 px-4 font-medium">
                  {formattedPrice(product.price)}
                </td>
                <td className="py-3 px-4">
                  <span className={product.stock === 0 ? 'text-red-500' : 'text-gray-600'}>
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
                      <Button variant="outline" size="sm">
                        <Pencil className="h-3 w-3 mr-1" />
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

        {(!products || products.length === 0) && (
          <div className="text-center py-16">
            <p className="text-gray-500">No hay productos aún</p>
            <Link href="/admin/products/new" className="text-blue-600 hover:underline text-sm mt-2 block">
              Crear primer producto
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}