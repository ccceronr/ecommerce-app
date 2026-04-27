import Navbar from '@/components/shared/Navbar'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-border mt-auto py-6 text-center text-xs text-muted-foreground/60">
        © {new Date().getFullYear()} Ecommerce App. Todos los derechos reservados.
      </footer>
    </div>
  )
}