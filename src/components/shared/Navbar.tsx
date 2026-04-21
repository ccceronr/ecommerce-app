'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function Navbar() {
  const router = useRouter()
  const { user, profile, isLoading, isAdmin } = useUser()
  const totalItems = useCart((state) => state.totalItems())
  const hasHydrated = useCart((state) => state._hasHydrated)

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Sesión cerrada correctamente')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Error al cerrar sesión')
    }
  }

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="font-bold text-xl text-foreground hover:text-muted-foreground transition-colors">
            Ecommerce App
          </Link>

          {/* Acciones */}
          <div className="flex items-center gap-3">

            <ThemeToggle />

            {/* Carrito — siempre visible, solo uno */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Carrito" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {hasHydrated && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Usuario */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent text-foreground"
                  aria-label="Menú de usuario"
                >
                  <User className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">
                      {profile?.full_name || 'Usuario'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/orders')}>
                    Mis órdenes
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Panel admin
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive cursor-pointer focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Iniciar sesión</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}