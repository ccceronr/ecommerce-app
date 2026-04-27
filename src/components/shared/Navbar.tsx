'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react'
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
    <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm shadow-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="font-heading font-bold text-xl tracking-tight text-foreground hover:text-primary transition-colors"
          >
            Ecommerce <span className="text-primary">App</span>
          </Link>

          {/* Acciones */}
          <div className="flex items-center gap-2">

            <ThemeToggle />

            {/* Carrito */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Carrito" className="relative hover:bg-primary/10 hover:text-primary transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {hasHydrated && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Usuario */}
            {isLoading ? (
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-primary/10 hover:text-primary text-foreground transition-colors"
                  aria-label="Menú de usuario"
                >
                  <User className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold truncate">
                      {profile?.full_name || 'Usuario'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/orders')} className="cursor-pointer">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Mis órdenes
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/admin/dashboard')} className="cursor-pointer">
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
                  <Button variant="ghost" size="sm" className="font-medium">Iniciar sesión</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="font-medium">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
