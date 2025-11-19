import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { i as Route, h as authClient, j as fetchDriverStatus, k as fetchDriverDeliveryRequests, m as cancelListingDelivery, r as requestListingDelivery, l as listingStatusLabels } from "./router-Ceaz144v.js";
import "@tanstack/react-router-devtools";
import "better-auth/react";
import "../server.js";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "./createMiddleware-CRzJRBrm.js";
function PublicListingsPage() {
  const {
    listings
  } = Route.useLoaderData();
  const sessionState = authClient.useSession();
  const userId = sessionState.data?.user.id;
  const [isDriver, setIsDriver] = useState(false);
  const [requestingId, setRequestingId] = useState(null);
  const [requestFeedback, setRequestFeedback] = useState(null);
  const isLoggedIn = !!userId;
  const [driverRequests, setDriverRequests] = useState(() => new Set(listings.filter((listing) => listing.viewerHasRequested).map((l) => l.id)));
  useEffect(() => {
    if (!isLoggedIn) {
      setIsDriver(false);
      setDriverRequests(/* @__PURE__ */ new Set());
      return;
    }
    let cancelled = false;
    const checkStatus = async () => {
      try {
        const status = await fetchDriverStatus();
        if (!cancelled) {
          setIsDriver(status.isDriver);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[driver-status] Unable to fetch status", error);
          setIsDriver(false);
        }
      }
    };
    void checkStatus();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);
  useEffect(() => {
    const shouldLoadRequests = isLoggedIn && isDriver;
    if (!shouldLoadRequests) {
      return;
    }
    let cancelled = false;
    const loadRequests = async () => {
      try {
        const ids = await fetchDriverDeliveryRequests();
        if (!cancelled) {
          setDriverRequests(new Set(ids));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[driver-request] Unable to fetch", error);
        }
      }
    };
    void loadRequests();
    return () => {
      cancelled = true;
    };
  }, [isDriver, isLoggedIn]);
  const handleToggleRequest = async (listingId, alreadyRequested) => {
    setRequestingId(listingId);
    setRequestFeedback(null);
    setDriverRequests((prev) => {
      const next = new Set(prev);
      if (alreadyRequested) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });
    try {
      const result = alreadyRequested ? await cancelListingDelivery(listingId) : await requestListingDelivery(listingId);
      setRequestFeedback({
        type: "success",
        message: result.message ?? "Action effectuée.",
        listingId
      });
    } catch (error) {
      setDriverRequests((prev) => {
        const next = new Set(prev);
        if (alreadyRequested) {
          next.add(listingId);
        } else {
          next.delete(listingId);
        }
        return next;
      });
      const message = error instanceof Error ? error.message : "Impossible de traiter votre demande.";
      setRequestFeedback({
        type: "error",
        message,
        listingId
      });
    } finally {
      setRequestingId(null);
    }
  };
  const canDisplayDriverActions = isLoggedIn && isDriver;
  return /* @__PURE__ */ jsxs("section", { className: "space-y-6 p-4", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-wide text-slate-500", children: "Explorer" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Tous les listings" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx(Link, { to: "/mes-listings", className: "rounded-md border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50", children: "Voir mes listings" }),
        /* @__PURE__ */ jsx(Link, { to: "/listings/new", className: "rounded-md bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800", children: "Créer un listing" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600", children: "Cette page est accessible sans compte pour parcourir les derniers listings publiés." }),
    listings.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Aucun listing public n’est disponible pour le moment." }) : /* @__PURE__ */ jsx("ul", { className: "space-y-4", children: listings.map((listing) => {
      const alreadyRequested = driverRequests.has(listing.id);
      const canRequest = canDisplayDriverActions && listing.ownerId !== void 0 && listing.ownerId !== userId && listing.status === "published";
      return /* @__PURE__ */ jsx(ListingCard, { listing, canRequestDelivery: canRequest, hasRequested: alreadyRequested, onRequestDelivery: () => handleToggleRequest(listing.id, alreadyRequested), requesting: requestingId === listing.id, feedback: requestFeedback?.listingId === listing.id ? requestFeedback : null }, listing.id);
    }) })
  ] });
}
function ListingCard({
  listing,
  canRequestDelivery,
  hasRequested,
  onRequestDelivery,
  requesting,
  feedback
}) {
  return /* @__PURE__ */ jsxs("li", { className: "rounded-lg border border-slate-200 bg-white p-4 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-slate-900", children: listing.title }),
        listing.shortDescription && /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: listing.shortDescription })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-2", children: [
        /* @__PURE__ */ jsx(StatusBadge, { status: listing.status }),
        canRequestDelivery && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-1", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: onRequestDelivery, disabled: requesting, className: "rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400", children: requesting ? "Envoi…" : hasRequested ? "Annuler la demande" : "Demander à livrer" }),
          feedback && /* @__PURE__ */ jsx("p", { className: `text-xs ${feedback.type === "success" ? "text-emerald-600" : "text-rose-600"}`, children: feedback.message })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Retrait" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-800", children: listing.pickupAddress })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Livraison" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-800", children: listing.deliveryAddress })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Budget estimé" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-slate-900", children: formatBudget(listing) })
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
export {
  PublicListingsPage as component
};
