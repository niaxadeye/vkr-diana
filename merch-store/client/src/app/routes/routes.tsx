import { createBrowserRouter } from "react-router";

import { RootLayout } from "@/app/layouts/RootLayout";
import { ProtectedRoute } from "@/app/routes/ProtectedRoute";

import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";

import { CartPage } from "@/pages/cart/CartPage";
import { CatalogPage } from "@/pages/catalog/CatalogPage";
import { HomePage } from "@/pages/home/HomePage";
import { NotFoundPage } from "@/pages/not-found/NotFoundPage";
import { ProductPage } from "@/pages/product/ProductPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { AdminLayout } from "@/pages/admin/layout/AdminLayout";
import { AdminProductsPage } from "@/pages/admin/products/AdminProductsPage";
import { ProductFormPage } from "@/pages/admin/product-form/ProductFormPage";
import { AdminCollectionsPage } from "@/pages/admin/collections/AdminCollectionsPage";
import { CollectionFormPage } from "@/pages/admin/collection-form/CollectionFormPage";
import { ProfileOrderPage } from "@/pages/profile-order/ProfileOrderPage";
import { AdminOrdersPage } from "@/pages/admin/orders/AdminOrdersPage";
import { AdminOrderDetailsPage } from "@/pages/admin/order-details/AdminOrderDetailsPage";
import { AdminDashboardPage } from "@/pages/admin/dashboard/AdminDashboardPage";
import { AdminInventoryPage } from "@/pages/admin/inventory/AdminInventoryPage";
import { CollectionPage } from "@/pages/collection/CollectionPage";
import { ContactsPage } from "@/pages/contacts/ContactsPage";
import { ProfileAddressCreatePage } from "@/pages/profile-address-create/ProfileAddressCreatePage";
import { ProfileAddressEditPage } from "@/pages/profile-address-edit/ProfileAddressEditPage";
import { InformationPage } from "@/pages/information/InformationPage";
import { AdminHomePage } from "@/pages/admin/home/AdminHomePage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/reset-password",
    Component: ResetPasswordPage,
  },
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "catalog", Component: CatalogPage },
      { path: "products/:slug", Component: ProductPage },
      { path: "collections/:slug", Component: CollectionPage },
      { path: "cart", Component: CartPage },
      { path: "contacts", Component: ContactsPage },
      { path: "information", Component: InformationPage },

      {
        Component: ProtectedRoute,
        children: [
          {
            path: "profile",
            Component: ProfilePage,
          },
          {
            path: "profile/addresses/new",
            Component: ProfileAddressCreatePage,
          },
          {
            path: "profile/addresses/:id/edit",
            Component: ProfileAddressEditPage,
          },
          {
            path: "profile/orders/:id",
            Component: ProfileOrderPage,
          },
        ],
      },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      {
        index: true,
        Component: AdminDashboardPage,
      },
      {
        path: "products",
        Component: AdminProductsPage,
      },
      {
        path: "products/create",
        Component: ProductFormPage,
      },
      {
        path: "products/:id/edit",
        Component: ProductFormPage,
      },
      {
        path: "collections",
        Component: AdminCollectionsPage,
      },
      {
        path: "collections/create",
        Component: CollectionFormPage,
      },
      {
        path: "collections/:id/edit",
        Component: CollectionFormPage,
      },
      {
        path: "orders",
        Component: AdminOrdersPage,
      },
      {
        path: "orders/:id",
        Component: AdminOrderDetailsPage,
      },
      {
        path: "inventory",
        Component: AdminInventoryPage,
      },
      {
        path: "home",
        Component: AdminHomePage,
      },
    ],
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);