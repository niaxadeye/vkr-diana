import type { ProductDetails } from "./product.types";

export const productMock: ProductDetails = {
  id: "567",
  slug: "hoodie-iem-katowice-breakthrough",
  title: "ХУДИ IEM KATOWICE BREAKTHROUGH",
  description:
    "Командное худи Team Spirit сезона 25-26 года. Именно в таких худи выступают игроки Team Spirit. Худи имеет сменный патч без спонсора.",
  material: "100% хлопок",
  price: 7199,
  images: [
    "/images/products/hoodie-katowice.webp",
    "/images/products/pro-kit-hoodie.webp",
    "/images/products/black-hoodie.webp",
  ],
  variants: [
    { id: "1", size: "S", stock: 0 },
    { id: "2", size: "M", stock: 4 },
    { id: "3", size: "L", stock: 2 },
    { id: "4", size: "XL", stock: 0 },
  ],
};