import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../types/product'

interface ProductState {
  products: Product[]
  addProduct: (data: Omit<Product, 'id' | 'createdAt'>) => Product
  updateProduct: (id: string, data: Omit<Product, 'id' | 'createdAt'>) => void
  deleteProduct: (id: string) => void
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: [],

      addProduct: (data) => {
        const product: Product = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }
        set((state) => ({ products: [product, ...state.products] }))
        return product
      },

      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'factura-tn-products',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.products = state.products.map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        }))
      },
    }
  )
)
