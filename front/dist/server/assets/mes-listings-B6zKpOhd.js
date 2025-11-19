import { jsx, jsxs } from "react/jsx-runtime";
import { useRouter, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { d as Route, e as acceptListingRequest, l as listingStatusLabels, f as fetchListingRequests } from "./router-Ceaz144v.js";
import "@tanstack/react-router-devtools";
import "better-auth/react";
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
  const [editableListings, setEditableListings] = useState(listings);
  useEffect(() => {
    setEditableListings(listings);
  }, [listings]);
  const handleListingUpdate = (id, updates) => {
    setEditableListings((prev) => prev.map((item) => item.id === id ? {
      ...item,
      ...updates
    } : item));
  };
  useEffect(() => {
    if (needsClientFetch) {
      void router.invalidate();
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
    editableListings.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {}) : /* @__PURE__ */ jsx("ul", { className: "space-y-4", children: editableListings.map((listing) => /* @__PURE__ */ jsx(ListingCard, { listing, onUpdate: (updates) => handleListingUpdate(listing.id, updates) }, listing.id)) })
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
  listing,
  onUpdate
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(listing);
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [acceptingRequestId, setAcceptingRequestId] = useState(null);
  useEffect(() => {
    setDraft(listing);
  }, [listing]);
  const handleFieldChange = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  const handleBudgetChange = (value) => {
    handleFieldChange("budget", value === "" ? void 0 : Number(value));
  };
  const handleSave = (event) => {
    event.preventDefault();
    onUpdate(draft);
    setIsEditing(false);
  };
  const handleCancel = () => {
    setDraft(listing);
    setIsEditing(false);
  };
  const handleToggleRequests = async () => {
    const nextShow = !showRequests;
    setShowRequests(nextShow);
    if (!nextShow || requests.length > 0) {
      return;
    }
    setLoadingRequests(true);
    setRequestError(null);
    try {
      const data = await fetchListingRequests(listing.id);
      setRequests(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de charger les offres pour ce listing.";
      setRequestError(message);
    } finally {
      setLoadingRequests(false);
    }
  };
  return /* @__PURE__ */ jsxs("li", { className: "rounded-lg border border-slate-200 bg-white p-4 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-slate-900", children: listing.title }),
        listing.shortDescription && /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: listing.shortDescription })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx(StatusBadge, { status: listing.status }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setIsEditing((prev) => !prev), className: "rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50", children: isEditing ? "Fermer" : "Modifier" })
      ] })
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
    ] }),
    Boolean(listing.deliveryRequestCount) && /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-md border border-slate-200 p-3", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: handleToggleRequests, className: "text-sm font-medium text-slate-700 underline-offset-2 hover:underline", children: showRequests ? "Masquer les offres des livreurs" : `Voir les ${listing.deliveryRequestCount} offre${listing.deliveryRequestCount && listing.deliveryRequestCount > 1 ? "s" : ""}` }),
      showRequests && /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-2", children: [
        loadingRequests && /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Chargement des offres…" }),
        requestError && /* @__PURE__ */ jsx("p", { className: "text-sm text-rose-600", children: requestError }),
        !loadingRequests && !requestError && requests.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Aucun livreur n’a encore postulé." }),
        !loadingRequests && requests.length > 0 && /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: requests.map((req) => /* @__PURE__ */ jsxs("li", { className: "rounded border border-slate-200 p-2 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-slate-900", children: req.driverName ?? "Livreur" }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-500", children: req.driverEmail })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-slate-500", children: [
            "Demande reçue le",
            " ",
            new Date(req.createdAt).toLocaleString("fr-FR")
          ] }),
          req.status === "pending" && /* @__PURE__ */ jsx("button", { type: "button", onClick: async () => {
            setAcceptingRequestId(req.id);
            setRequestError(null);
            try {
              await acceptListingRequest(listing.id, req.id);
              setRequests((prev) => prev.map((item) => item.id === req.id ? {
                ...item,
                status: "accepted"
              } : item.status === "pending" ? {
                ...item,
                status: "declined"
              } : item));
              onUpdate({
                status: "assigned"
              });
            } catch (error) {
              const message = error instanceof Error ? error.message : "Impossible d’accepter cette offre.";
              setRequestError(message);
            } finally {
              setAcceptingRequestId(null);
            }
          }, disabled: acceptingRequestId === req.id, className: "mt-2 rounded border border-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60", children: acceptingRequestId === req.id ? "Validation…" : "Accepter ce livreur" }),
          req.status === "accepted" && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs font-semibold uppercase text-emerald-600", children: "Livreur accepté" })
        ] }, req.id)) })
      ] })
    ] }),
    isEditing && /* @__PURE__ */ jsxs("form", { className: "mt-4 space-y-4 border-t border-slate-200 pt-4", onSubmit: handleSave, children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "text-sm text-slate-700", children: [
          "Titre",
          /* @__PURE__ */ jsx("input", { type: "text", className: "mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm", value: draft.title, onChange: (event) => handleFieldChange("title", event.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm text-slate-700", children: [
          "Budget",
          /* @__PURE__ */ jsx("input", { type: "number", className: "mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm", value: draft.budget ?? "", onChange: (event) => handleBudgetChange(event.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm text-slate-700", children: [
        "Description courte",
        /* @__PURE__ */ jsx("input", { type: "text", className: "mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm", value: draft.shortDescription ?? "", onChange: (event) => handleFieldChange("shortDescription", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm text-slate-700", children: [
        "Adresse de retrait",
        /* @__PURE__ */ jsx("input", { type: "text", className: "mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm", value: draft.pickupAddress, onChange: (event) => handleFieldChange("pickupAddress", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "text-sm text-slate-700", children: [
        "Adresse de livraison",
        /* @__PURE__ */ jsx("input", { type: "text", className: "mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm", value: draft.deliveryAddress, onChange: (event) => handleFieldChange("deliveryAddress", event.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("label", { className: "text-sm text-slate-700", children: [
          "Devise",
          /* @__PURE__ */ jsx("input", { type: "text", className: "mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm", value: draft.currency ?? "", onChange: (event) => handleFieldChange("currency", event.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "text-sm text-slate-700", children: [
          "Statut",
          /* @__PURE__ */ jsx("select", { className: "mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm", value: draft.status, onChange: (event) => handleFieldChange("status", event.target.value), children: Object.entries(listingStatusLabels).map(([key, label]) => /* @__PURE__ */ jsx("option", { value: key, children: label }, key)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx("button", { type: "submit", className: "rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800", children: "Enregistrer" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: handleCancel, className: "rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50", children: "Annuler" })
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
