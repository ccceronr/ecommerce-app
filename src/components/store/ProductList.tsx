'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ProductCard from './ProductCard'
import type { Product, Category } from '@/types'

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 12

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch {
      setCategories([])
    }
  }

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) params.append('search', search)
      if (selectedCategory) params.append('category', selectedCategory)

      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()

      setProducts(data.products || [])
      setTotal(data.total || 0)
    } catch {
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [page, search, selectedCategory])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleCategory = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setPage(1)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      {/* Filtros */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 rounded-full bg-card border-border focus-visible:ring-primary/30"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategory('')}
            className="rounded-full font-medium"
          >
            Todos
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategory(cat.id)}
              className="rounded-full font-medium"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid de productos */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
              <Skeleton className="h-56 w-full" />
              <div className="p-4 space-y-2.5">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between pt-1">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-foreground font-semibold text-lg mb-1">Sin resultados</p>
          <p className="text-muted-foreground">No se encontraron productos con esos filtros</p>
          {(search || selectedCategory) && (
            <Button
              variant="outline"
              className="mt-5 rounded-full"
              onClick={() => {
                setSearch('')
                setSelectedCategory('')
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <>
          {total > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              {total} {total === 1 ? 'producto encontrado' : 'productos encontrados'}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full px-6"
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground font-medium px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-full px-6"
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
