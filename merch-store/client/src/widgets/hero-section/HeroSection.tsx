import { Link } from "react-router";

import type { HeroBanner } from "@/pages/home/model/home.types";

type HeroSectionProps = {
  banner: HeroBanner;
};

export function HeroSection({ banner }: HeroSectionProps) {
  return (
    <section className="relative min-h-[calc(100svh-80px)] overflow-hidden bg-neutral-100 md:min-h-[calc(100vh-80px)]">
      {banner.videoDesktop ? (
        <>
          <video
            className="absolute inset-0 hidden h-full w-full object-cover md:block"
            src={banner.videoDesktop}
            poster={banner.imageDesktop}
            autoPlay
            muted
            loop
            playsInline
          />

          <video
            className="absolute inset-0 h-full w-full object-cover md:hidden"
            src={banner.videoMobile ?? banner.videoDesktop}
            poster={banner.imageMobile}
            autoPlay
            muted
            loop
            playsInline
          />
        </>
      ) : (
        <picture>
          <source media="(max-width: 767px)" srcSet={banner.imageMobile} />
          <img
            src={banner.imageDesktop}
            alt={banner.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />

      <div className="relative z-10 flex min-h-[calc(100svh-80px)] items-end md:min-h-[calc(100vh-80px)]">
        <div className="mx-auto w-full max-w-[1680px] pb-10 md:pb-[120px]">
          <div className="max-w-[920px] text-left text-white">
            <h1 className="text-[64px] uppercase">
              {banner.title}
            </h1>

            <Link to={banner.ctaHref}
              className="mt-6 inline-flex h-[54px] min-w-[157px] items-center justify-center whitespace-nowrap rounded-full bg-white px-8 text-[15px] leading-none text-[#060606] transition hover:bg-[#f0f0f0] md:mt-7">
              {banner.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}