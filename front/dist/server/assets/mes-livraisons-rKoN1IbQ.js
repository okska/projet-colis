import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { c as Route } from "./router-Ceaz144v.js";
import "react";
import "@tanstack/react-router-devtools";
import "better-auth/react";
import "../server.js";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "./createMiddleware-CRzJRBrm.js";
function DriverAssignmentsPage() {
  const {
    assignments
  } = Route.useLoaderData();
  const pending = assignments.filter((a) => a.status === "pending");
  const accepted = assignments.filter((a) => a.status === "accepted");
  return /* @__PURE__ */ jsxs("section", { className: "space-y-6 p-4", children: [
    /* @__PURE__ */ jsxs("header", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-wide text-slate-500", children: "Mes livraisons" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Livraisons à effectuer" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Retrouvez vos candidatures en attente et les missions déjà validées." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-800", children: "Missions acceptées" }),
      accepted.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Aucune mission validée pour le moment." }) : /* @__PURE__ */ jsx(AssignmentList, { items: accepted, highlight: "accepted" })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-800", children: "Candidatures en attente" }),
      pending.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Vous n’avez pas de candidatures en attente de validation." }) : /* @__PURE__ */ jsx(AssignmentList, { items: pending, highlight: "pending" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsx(Link, { to: "/listings", className: "text-sm font-medium text-cyan-700 underline-offset-2 hover:underline", children: "Explorer de nouvelles annonces" }) })
  ] });
}
function AssignmentList({
  items,
  highlight
}) {
  return /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: items.map((assignment) => /* @__PURE__ */ jsxs("li", { className: "rounded border border-slate-200 bg-white p-3 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsx("p", { className: "text-base font-semibold text-slate-900", children: assignment.listingTitle }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-600", children: [
        assignment.pickupAddress ?? "Adresse de retrait à confirmer",
        " →",
        " ",
        assignment.deliveryAddress ?? "Adresse de livraison à confirmer"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Candidature envoyée le",
        " ",
        new Date(assignment.createdAt).toLocaleString("fr-FR")
      ] }),
      /* @__PURE__ */ jsx("span", { className: `rounded px-2 py-0.5 font-semibold uppercase ${highlight === "accepted" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`, children: highlight === "accepted" ? "Acceptée" : "En attente" })
    ] })
  ] }, assignment.id)) });
}
export {
  DriverAssignmentsPage as component
};
