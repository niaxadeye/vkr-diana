import { CollectionsSection } from "@/widgets/collections-section/CollectionsSection";
import { HeroSection } from "@/widgets/hero-section/HeroSection";
import { RecommendedProductsSection } from "@/widgets/recommended-products-section/RecommendedProductsSection";

import {
  homeHeroBanner,
} from "./model/home.mock";

export function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* <AnnouncementBar text={announcementText} /> */}
      <HeroSection banner={homeHeroBanner} />
      <CollectionsSection />
      <RecommendedProductsSection/>
    </main>
  );
}