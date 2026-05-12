import { useEffect, useState } from "react";

import {
  getProducts,
  type ProductListItem,
} from "@/entities/product/api/product.api";
import { ProductCard } from "@/entities/product/ui/ProductCard";

export function CatalogPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getProducts({
        page: 1,
        limit: 100,
      });

      setProducts(response.data);
    } catch {
      setError("Не удалось загрузить товары");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-white px-4 pb-4 pt-4 xl:pt-12 xl:px-4">
      <div className="mx-auto max-w-[1680px]">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="h2">
              Все товары
            </h2>
          </div>

          {!isLoading && (
            <p className="text-[15px] text-neutral-500">
              {products.length} товаров
            </p>
          )}
        </div>

        {isLoading ? (
          <ProductSkeletonGrid />
        ) : error ? (
          <div className="rounded-3xl bg-neutral-100 px-6 py-12 text-center">
            <p className="text-[15px] text-neutral-500">{error}</p>

            <button
              type="button"
              onClick={loadProducts}
              className="mt-5 h-10 rounded-full bg-black px-5 text-[15px] text-white"
            >
              Повторить
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl bg-neutral-100 px-6 py-12 text-center">
            <p className="text-[15px] text-neutral-500">
              Активных товаров пока нет.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index}>
          <div className="aspect-[3/4] animate-pulse bg-neutral-100" />
          <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
          <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}