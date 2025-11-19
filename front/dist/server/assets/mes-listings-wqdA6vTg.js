import { jsx, jsxs } from "react/jsx-runtime";
import { useRouter, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { c as Route, l as listingStatusLabels } from "./router-CN_V_QYt.js";
import "@tanstack/react-router-devtools";
import "../server.js";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "./createMiddleware-CRzJRBrm.js";
function ListingsPage() {
  const {
    listings,
    needsClientFetch
  } = Route.useLoaderData();
  const router = useRouter();
  useEffect(() => {
    if (needsClientFetch) {
      void router.invalidate({
        to: "/mes-listings"
      });
    }
  }, [needsClientFetch, router]);
  if (needsClientFetch) {
    return /* @__PURE__ */ jsx("section", { className: "space-y-6 p-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Chargement des listings…" }) });
  }
  return /* @__PURE__ */ jsxs("section", { className: "space-y-6 p-4", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 uppercase tracking-wide", children: "Vos livraisons" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Mes listings" })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/listings/new", className: "rounded-md bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800", children: "Créer un listing" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600", children: "Les filtres et critères de recherche arriveront bientôt. Vous pourrez alors affiner les listings par statut, trajet ou fenêtre de retrait." }),
    listings.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {}) : /* @__PURE__ */ jsx("ul", { className: "space-y-4", children: listings.map((listing) => /* @__PURE__ */ jsx(ListingCard, { listing }, listing.id)) })
  ] });
}
function EmptyState() {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-slate-200 bg-white p-8 text-center", children: [
    /* @__PURE__ */ jsx("p", { className: "text-lg font-medium text-slate-700", children: "Aucun listing pour le moment." }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-500", children: "Ajoutez votre première livraison pour commencer à recevoir des demandes de drivers." }),
    /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(Link, { to: "/listings/new", className: "inline-flex rounded-md bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800", children: "Nouveau listing" }) })
  ] });
}
function ListingCard({
  listing
}) {
  return /* @__PURE__ */ jsxs("li", { className: "rounded-lg border border-slate-200 bg-white p-4 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-slate-900", children: listing.title }),
        listing.shortDescription && /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: listing.shortDescription })
      ] }),
      /* @__PURE__ */ jsx(StatusBadge, { status: listing.status })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Retrait" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-800", children: listing.pickupAddress }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: formatWindow(listing.pickupWindow) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Livraison" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-800", children: listing.deliveryAddress })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Budget estimé" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-slate-900", children: formatBudget(listing) }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500", children: [
          "Créé le ",
          new Date(listing.createdAt).toLocaleDateString("fr-FR")
        ] })
      ] })
    ] })
  ] });
}
function StatusBadge({
  status
}) {
  const label = listingStatusLabels[status];
  const colorByStatus = {
    draft: "bg-slate-200 text-slate-800",
    published: "bg-emerald-100 text-emerald-700",
    assigned: "bg-indigo-100 text-indigo-700",
    ready_for_pickup: "bg-yellow-100 text-yellow-800",
    in_transit: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-rose-100 text-rose-700",
    disputed: "bg-orange-100 text-orange-700",
    archived: "bg-slate-100 text-slate-500"
  };
  return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${colorByStatus[status]}`, children: label });
}
function formatBudget(listing) {
  if (!listing.budget || !listing.currency) {
    return "À définir";
  }
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: listing.currency,
    maximumFractionDigits: 0
  }).format(listing.budget);
}
function formatWindow(window) {
  if (!window) {
    return "Fenêtre à confirmer";
  }
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
  return `${formatter.format(new Date(window.start))} → ${formatter.format(new Date(window.end))}`;
}
export {
  ListingsPage as component
};
