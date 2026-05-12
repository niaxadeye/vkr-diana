import { RouterProvider as ReactRouterProvider } from "react-router";

import { router } from "@/app/routes/routes";

export function RouterProvider() {
  return <ReactRouterProvider router={router} />;
}