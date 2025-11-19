import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
function Home() {
  return /* @__PURE__ */ jsxs("section", { className: "space-y-6 p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-8 shadow-sm", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-wide text-slate-500", children: "Projet Colis" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-2 text-3xl font-semibold text-slate-900", children: "Gérez vos listings de livraison" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-2xl text-slate-600", children: "Publiez vos trajets, suivez les candidatures des drivers et contrôlez l’avancement de chaque colis depuis un seul espace." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsx(Link, { to: "/listings/new", className: "rounded-md bg-slate-900 px-5 py-2 text-white transition hover:bg-slate-800", children: "Créer un listing" }),
        /* @__PURE__ */ jsx(Link, { to: "/mes-listings", className: "rounded-md border border-slate-300 px-5 py-2 text-slate-700 transition hover:bg-slate-50", children: "Voir mes listings" }),
        /* @__PURE__ */ jsx(Link, { to: "/listings", className: "rounded-md border border-slate-300 px-5 py-2 text-slate-700 transition hover:bg-slate-50", children: "Voir tous les listings" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-slate-200 bg-slate-50 p-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "À venir très bientôt" }),
      /* @__PURE__ */ jsxs("ul", { className: "mt-3 list-disc space-y-1 pl-6 text-sm text-slate-600", children: [
        /* @__PURE__ */ jsx("li", { children: "Filtres par statut, trajet et disponibilité des drivers." }),
        /* @__PURE__ */ jsx("li", { children: "Intégration directe avec le back-office listings/driver." }),
        /* @__PURE__ */ jsx("li", { children: "Notifications pour les nouveaux trajets publiés." })
      ] })
    ] })
  ] });
}
export {
  Home as component
};
