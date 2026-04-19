import ProductList from '@/components/store/ProductList'

export default function StorePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Nuestros productos
        </h1>
        <p className="text-gray-600">
          Encuentra lo que necesitas en nuestra tienda
        </p>
      </div>
      <ProductList />
    </div>
  )
}