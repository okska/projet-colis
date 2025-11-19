import { jsxs, jsx } from "react/jsx-runtime";
import { f as Route } from "./router-CN_V_QYt.js";
import "@tanstack/react-router";
import "@tanstack/react-router-devtools";
import "../server.js";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "./createMiddleware-CRzJRBrm.js";
function UserComponent() {
  const user = Route.useLoaderData();
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx("h4", { className: "text-xl font-bold underline", children: user.name }),
    /* @__PURE__ */ jsx("div", { className: "text-sm", children: user.email }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("a", { href: `/api/users/${user.id}`, className: "text-blue-800 hover:text-blue-600 underline", children: "View as JSON" }) })
  ] });
}
export {
  UserComponent as component
};
