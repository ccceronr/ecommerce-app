import { createClient } from '@/lib/supabase/server'
import UserRoleManager from '@/components/admin/UserRoleManager'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-500 mt-1">
          {users?.length || 0} usuarios registrados
        </p>
      </div>
      <UserRoleManager initialUsers={users || []} />
    </div>
  )
}