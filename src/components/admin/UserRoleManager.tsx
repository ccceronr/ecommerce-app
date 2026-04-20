'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface UserRoleManagerProps {
  initialUsers: Profile[]
}

export default function UserRoleManager({ initialUsers }: UserRoleManagerProps) {
  const router = useRouter()
  const [users, setUsers] = useState<Profile[]>(initialUsers)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: 'customer' | 'admin') => {
    setLoadingId(userId)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )

      toast.success('Rol actualizado correctamente')
      router.refresh()
    } catch {
      toast.error('Error al actualizar el rol')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-3 px-4 font-medium text-gray-500">Usuario</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Rol actual</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Cambiar rol</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Registro</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <p className="font-medium text-gray-900">
                  {user.full_name || 'Sin nombre'}
                </p>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  {user.id.slice(0, 8)}...
                </p>
              </td>
              <td className="py-3 px-4">
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Select
                    defaultValue={user.role}
                    onValueChange={(value) =>
                      handleRoleChange(user.id, value as 'customer' | 'admin')
                    }
                    disabled={loadingId === user.id}
                  >
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Cliente</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  {loadingId === user.id && (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-gray-500">
                {new Date(user.created_at).toLocaleDateString('es-CO')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No hay usuarios registrados</p>
        </div>
      )}
    </div>
  )
}