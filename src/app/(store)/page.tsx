import ProductList from '@/components/store/ProductList'

export default function StorePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Nuestros productos
        </h1>
        <p className="text-muted-foreground">
          Encuentra lo que necesitas en nuestra tienda
        </p>
      </div>
      <ProductList />
    </div>
  )
}