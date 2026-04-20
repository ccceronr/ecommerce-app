import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ProductForm from '@/components/admin/ProductForm'

export default async function NewProductPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (!categories) {
    redirect('/admin/products')
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products">
          <Button variant="outline" size="sm">← Volver</Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo producto</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}