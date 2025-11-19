import { jsxs, jsx } from "react/jsx-runtime";
import { a as Route } from "./router-CN_V_QYt.js";
import "@tanstack/react-router";
import "@tanstack/react-router-devtools";
import "../server.js";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "./createMiddleware-CRzJRBrm.js";
function Posts2Component() {
  const posts = Route.useLoaderData();
  return /* @__PURE__ */ jsxs("div", { className: "p-2", children: [
    /* @__PURE__ */ jsx("h3", { children: "Posts from Drizzle ORM" }),
    /* @__PURE__ */ jsx("ul", { className: "list-disc pl-4", children: posts.map((post) => /* @__PURE__ */ jsx("li", { className: "whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { children: post.title }) }, post.id)) })
  ] });
}
export {
  Posts2Component as component
};
