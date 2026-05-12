import { useEffect, useState } from "react";

import {
    getProducts,
    type ProductListItem,
} from "@/entities/product/api/product.api";
import { ProductCard } from "@/entities/product/ui/ProductCard";

export function ProductGrid() {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    async function loadProducts() {
        setIsLoading(true);

        try {
            const response = await getProducts({
                page: 1,
                limit: 5,
            });

            setProducts(response.data);
        } catch (error) {
            console.error("LOAD_HOME_PRODUCTS_ERROR:", error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadProducts();
    }, []);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-5 md:gap-y-11 lg:grid-cols-4 xl:grid-cols-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                        <div className="aspect-[3/4] bg-neutral-100" />
                        <div className="mt-3 h-3 w-3/4 rounded-full bg-neutral-100" />
                        <div className="mt-2 h-3 w-1/3 rounded-full bg-neutral-100" />
                    </div>
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-5 md:gap-y-11 lg:grid-cols-4 xl:grid-cols-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}