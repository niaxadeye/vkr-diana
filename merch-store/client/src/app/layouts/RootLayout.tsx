import { Outlet } from "react-router";

import { Header } from "@/widgets/layout/header/Header";
import { Footer } from "@/widgets/layout/footer/Footer";
import { ScrollToTop } from "@/shared/lib/ScrollToTop";
import { PageLoadingBar } from "@/shared/ui/page-loading-bar/PageLoadingBar";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-white">

      <PageLoadingBar />

      <ScrollToTop />

      <Header />

      <Outlet />

      <Footer />
    </div>
  );
}