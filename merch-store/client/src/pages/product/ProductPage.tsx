import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import {
  getProductBySlug,
  type ProductDetails,
} from "@/entities/product/api/product.api";
import { ProductShowcase } from "./ui/ProductShowcase";
import { RecommendedProductsSection } from "@/widgets/recommended-products-section/RecommendedProductsSection";
import { ProductAccordionSection } from "@/pages/product/ui/ProductAccordionSection";

export function ProductPage() {
  const { slug } = useParams();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProduct() {
    if (!slug) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getProductBySlug(slug);
      setProduct(data);
    } catch {
      setError("Товар не найден");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f3f3f3]">
        <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
          <div className="animate-pulse bg-neutral-200" />
          <div className="animate-pulse bg-neutral-100" />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4 text-center">
        <div>
          <h1 className="text-[36px] tracking-[-0.05em] text-black">
            Товар не найден
          </h1>

          <p className="mt-3 text-[15px] text-neutral-500">
            Возможно, товар был удалён или ещё не опубликован.
          </p>

          <Link
            to="/catalog"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-[15px] text-white"
          >
            В каталог
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#fff]">
      <ProductShowcase product={product} />

      <section className="mx-auto max-w-[1680px] px-4 py-4 md:py-14 md:px-0">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <ProductAccordionSection items={product.accordionItems} />

          <div aria-hidden="true" />
        </div>
      </section>
      <RecommendedProductsSection />
    </main>
  );
}