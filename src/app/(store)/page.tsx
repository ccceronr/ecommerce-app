import ProductList from '@/components/store/ProductList'

export default function StorePage() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/12 via-background to-accent/30 border border-primary/15 px-8 py-10 sm:px-12 sm:py-14">
          {/* Círculos decorativos */}
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
          <div className="absolute right-8 bottom-0 w-40 h-40 rounded-full bg-accent/40 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-3">
              Bienvenido
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3 leading-tight">
              Descubre nuestra<br />
              <span className="text-primary">colección</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md leading-relaxed">
              Productos cuidadosamente seleccionados, con la mejor calidad para ti.
            </p>
          </div>
        </div>
      </div>

      <ProductList />
    </div>
  )
}
