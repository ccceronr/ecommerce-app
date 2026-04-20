import { createClient } from '@/lib/supabase/server'
import CategoryManager from '@/components/admin/CategoryManager'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
        <p className="text-gray-500 mt-1">
          {categories?.length || 0} categorías en total
        </p>
      </div>
      <CategoryManager initialCategories={categories || []} />
    </div>
  )
}