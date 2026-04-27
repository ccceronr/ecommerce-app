import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-12 px-4">
      {/* Decorative blobs */}
      <div className="absolute -top-48 -right-48 w-[32rem] h-[32rem] rounded-full bg-primary/6 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -left-48 w-[32rem] h-[32rem] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-accent/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block font-heading font-bold text-2xl tracking-tight text-foreground hover:text-primary transition-colors"
          >
            Ecommerce <span className="text-primary">App</span>
          </Link>
          <p className="text-xs text-muted-foreground/70 mt-1.5 tracking-wide">Tu tienda online</p>
        </div>
        {children}
      </div>
    </div>
  )
}
