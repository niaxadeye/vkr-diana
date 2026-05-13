import { useEffect, useState } from "react";

import { getHomeHero } from "@/entities/home/api/home.api";
import type { HomeHeroBanner } from "@/entities/home/model/home.types";
import { CollectionsSection } from "@/widgets/collections-section/CollectionsSection";
import { HeroSection } from "@/widgets/hero-section/HeroSection";
import { RecommendedProductsSection } from "@/widgets/recommended-products-section/RecommendedProductsSection";

import { homeHeroBanner } from "./model/home.mock";

export function HomePage() {
  const [heroBanner, setHeroBanner] = useState<HomeHeroBanner>(homeHeroBanner);
  const [isHeroLoading, setIsHeroLoading] = useState(true);

  useEffect(() => {
    async function loadHero() {
      try {
        setIsHeroLoading(true);

        const hero = await getHomeHero();

        if (hero.isActive) {
          setHeroBanner(hero);
        }
      } catch (error) {
        console.error("LOAD_HOME_HERO_ERROR:", error);
        setHeroBanner(homeHeroBanner);
      } finally {
        setIsHeroLoading(false);
      }
    }

    void loadHero();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <HeroSection banner={heroBanner} isLoading={isHeroLoading} />
      <CollectionsSection />
      <RecommendedProductsSection />
    </main>
  );
}