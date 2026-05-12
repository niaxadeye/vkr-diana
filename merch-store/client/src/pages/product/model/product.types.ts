export type ProductVariant = {
  id: string;
  size: string;
  stock: number;
};

export type ProductDetails = {
  id: string;
  slug: string;
  title: string;
  description: string;
  material: string;
  price: number;
  oldPrice?: number;
  images: string[];
  variants: ProductVariant[];
};