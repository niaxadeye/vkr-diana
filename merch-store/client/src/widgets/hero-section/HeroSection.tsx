import { Link } from "react-router";

import type { HomeHeroBanner } from "@/entities/home/model/home.types";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";
import { cn } from "@/shared/lib/cn";

type HeroSectionProps = {
  banner: HomeHeroBanner;
  isLoading?: boolean;
};

export function HeroSection({ banner, isLoading = false }: HeroSectionProps) {
  const imageDesktop = getMediaUrl(banner.imageDesktop);
  const imageMobile = getMediaUrl(banner.imageMobile);

  const videoDesktop = banner.videoDesktop
    ? getMediaUrl(banner.videoDesktop)
    : null;

  const videoMobile = banner.videoMobile
    ? getMediaUrl(banner.videoMobile)
    : videoDesktop;

  return (
    <section className="bg-white md:relative md:min-h-[calc(100vh-80px)] md:overflow-hidden md:bg-neutral-100">
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 md:absolute md:inset-0 md:aspect-auto md:h-full">
        {videoDesktop ? (
          <>
            <video
              className="absolute inset-0 hidden h-full w-full object-cover md:block"
              src={videoDesktop}
              poster={imageDesktop}
              autoPlay
              muted
              loop
              playsInline
            />

            <video
              className="absolute inset-0 h-full w-full object-cover md:hidden"
              src={videoMobile ?? videoDesktop}
              poster={imageMobile || imageDesktop}
              autoPlay
              muted
              loop
              playsInline
            />
          </>
        ) : (
          <picture>
            <source media="(max-width: 767px)" srcSet={imageMobile || imageDesktop} />

            <img
              src={imageDesktop}
              alt={banner.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
        )}

        {isLoading && (
          <div className="absolute inset-0 animate-pulse bg-black/5" />
        )}
      </div>

      <div className="hidden md:absolute md:inset-0 md:block md:bg-gradient-to-b md:from-black/10 md:via-transparent md:to-black/45" />

      <div className="relative z-10 md:flex md:min-h-[calc(100vh-80px)] md:items-end">
        <div className="mx-auto w-full max-w-[1680px] px-4 pb-9 pt-8 md:px-0 md:pb-[120px] md:pt-0 lg:px-0">
          <div className="max-w-[920px] text-left text-black md:text-white">
            <h1
              className={cn(
                "text-[36px] font-[500] uppercase leading-[42px] tracking-[-0.04em] md:text-[64px] md:leading-[72px]",
                isLoading && "opacity-70",
              )}
            >
              {banner.title}
            </h1>

            <Link
              to={banner.ctaHref}
              className="mt-5 inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-full bg-black px-8 text-[15px] font-medium leading-none text-white transition hover:bg-[#222222] md:mt-7 md:h-[54px] md:w-auto md:min-w-[157px] md:bg-white md:text-[#060606] md:hover:bg-[#f0f0f0]"
            >
              {banner.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}