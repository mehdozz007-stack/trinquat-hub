import { QueryClient } from "@tanstack/react-query";
import { createRouter, RootRoute, Route } from "@tanstack/react-router";
import { Route as RootRouteComponent } from "./routes/__root";
import { Route as IndexRouteComponent } from "./routes/index";
import { Route as AssociationRouteComponent } from "./routes/association";
import { Route as EvenementsRouteComponent } from "./routes/evenements";
import { Route as GalerieRouteComponent } from "./routes/galerie";
import { Route as ContactRouteComponent } from "./routes/contact";
import { Route as MentionsLegalesRouteComponent } from "./routes/mentions-legales";
import { Route as PolitiqueConfidentialiteRouteComponent } from "./routes/politique-confidentialite";
import { Route as AdminLoginRouteComponent } from "./routes/admin.login";
import { Route as AdminNewsletterRouteComponent } from "./routes/admin.newsletter";

// Create root route
const rootRoute = RootRouteComponent as any;

// Create child routes
const indexRoute = IndexRouteComponent.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRoute,
} as any);

const associationRoute = AssociationRouteComponent.update({
  id: "/association",
  path: "/association",
  getParentRoute: () => rootRoute,
} as any);

const evenementsRoute = EvenementsRouteComponent.update({
  id: "/evenements",
  path: "/evenements",
  getParentRoute: () => rootRoute,
} as any);

const galerieRoute = GalerieRouteComponent.update({
  id: "/galerie",
  path: "/galerie",
  getParentRoute: () => rootRoute,
} as any);

const contactRoute = ContactRouteComponent.update({
  id: "/contact",
  path: "/contact",
  getParentRoute: () => rootRoute,
} as any);

const mentionsLegalesRoute = MentionsLegalesRouteComponent.update({
  id: "/mentions-legales",
  path: "/mentions-legales",
  getParentRoute: () => rootRoute,
} as any);

const politiqueConfidentialiteRoute = PolitiqueConfidentialiteRouteComponent.update({
  id: "/politique-confidentialite",
  path: "/politique-confidentialite",
  getParentRoute: () => rootRoute,
} as any);

const adminLoginRoute = AdminLoginRouteComponent.update({
  id: "/admin/login",
  path: "/admin/login",
  getParentRoute: () => rootRoute,
} as any);

const adminNewsletterRoute = AdminNewsletterRouteComponent.update({
  id: "/admin/newsletter",
  path: "/admin/newsletter",
  getParentRoute: () => rootRoute,
} as any);

const routeTree = rootRoute.addChildren([
  indexRoute,
  associationRoute,
  evenementsRoute,
  galerieRoute,
  contactRoute,
  mentionsLegalesRoute,
  politiqueConfidentialiteRoute,
  adminLoginRoute,
  adminNewsletterRoute,
]);

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
