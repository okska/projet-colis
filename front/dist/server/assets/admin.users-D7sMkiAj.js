import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { q as Route, s as fetchAdminUsers, t as promoteUserToDriver } from "./router-Ceaz144v.js";
import "@tanstack/react-router";
import "@tanstack/react-router-devtools";
import "better-auth/react";
import "../server.js";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "./createMiddleware-CRzJRBrm.js";
const driverStatusLabels = {
  pending_verification: "En vérification",
  active: "Actif",
  suspended: "Suspendu",
  blocked: "Bloqué"
};
function AdminUsersPage() {
  const {
    allowed,
    users: initialUsers,
    needsClientFetch
  } = Route.useLoaderData();
  const [users, setUsers] = useState(initialUsers);
  const [isAllowed, setIsAllowed] = useState(allowed);
  const [isLoading, setIsLoading] = useState(needsClientFetch);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    setUsers(initialUsers);
    setIsAllowed(allowed);
  }, [allowed, initialUsers]);
  useEffect(() => {
    if (!needsClientFetch) {
      return;
    }
    let cancelled = false;
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const users2 = await fetchAdminUsers();
        if (cancelled) return;
        setUsers(users2);
        setIsAllowed(true);
      } catch (err) {
        if (cancelled) return;
        const status = err?.status;
        if (status === 401 || status === 403) {
          setIsAllowed(false);
        } else {
          setError(err instanceof Error ? err.message : "Impossible de charger les utilisateurs.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    void fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [needsClientFetch]);
  if (!isAllowed) {
    return /* @__PURE__ */ jsxs("section", { className: "space-y-4 p-4", "aria-busy": isLoading, children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Administration" }),
      isLoading ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600", children: "Chargement…" }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600", children: "Vous devez être administrateur pour accéder à cette page." })
    ] });
  }
  const handlePromote = async (userId) => {
    setPendingUserId(userId);
    setError(null);
    try {
      const updated = await promoteUserToDriver(userId);
      setUsers((prev) => prev.map((user) => user.id === userId ? updated : user));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de mettre à jour ce profil.";
      setError(message);
    } finally {
      setPendingUserId(null);
    }
  };
  return /* @__PURE__ */ jsxs("section", { className: "space-y-4 p-4", children: [
    /* @__PURE__ */ jsxs("header", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm uppercase tracking-wide text-slate-500", children: "Administration" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Gestion des utilisateurs" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "Consultez les comptes inscrits et activez leur rôle de livreur." })
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700", children: error }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-md border border-slate-200 bg-white", "aria-busy": isLoading, children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-slate-200 text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2", children: "Utilisateur" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2", children: "Email" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2", children: "Statut livreur" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-2 text-right", children: "Action" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-100", children: users.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-4 py-4 text-sm text-slate-500", colSpan: 4, children: "Aucun utilisateur à afficher." }) }) : users.map((user) => /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-slate-900", children: user.name ?? "Utilisateur sans nom" }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-600", children: user.email }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: user.driverStatus ? driverStatusLabels[user.driverStatus] : "Non livreur" }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: () => handlePromote(user.id), disabled: user.isDriver || pendingUserId === user.id, className: "rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400", children: user.isDriver ? "Déjà livreur" : pendingUserId === user.id ? "Activation…" : "Activer comme livreur" }) })
      ] }, user.id)) })
    ] }) })
  ] });
}
export {
  AdminUsersPage as component
};
