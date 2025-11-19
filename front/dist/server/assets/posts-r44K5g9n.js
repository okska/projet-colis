import { jsxs, jsx } from "react/jsx-runtime";
import { Link, Outlet } from "@tanstack/react-router";
import { b as Route } from "./router-CN_V_QYt.js";
import "@tanstack/react-router-devtools";
import "../server.js";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "./createMiddleware-CRzJRBrm.js";
function PostsComponent() {
  const posts = Route.useLoaderData();
  return /* @__PURE__ */ jsxs("div", { className: "p-2 flex gap-2", children: [
    /* @__PURE__ */ jsx("ul", { className: "list-disc pl-4", children: [...posts, {
      id: "i-do-not-exist",
      title: "Non-existent Post"
    }].map((post) => {
      return /* @__PURE__ */ jsx("li", { className: "whitespace-nowrap", children: /* @__PURE__ */ jsx(Link, { to: "/posts/$postId", params: {
        postId: String(post.id)
      }, className: "block py-1 text-blue-800 hover:text-blue-600", activeProps: {
        className: "text-black font-bold"
      }, children: /* @__PURE__ */ jsx("div", { children: post.title.substring(0, 20) }) }) }, post.id);
    }) }),
    /* @__PURE__ */ jsx("hr", {}),
    /* @__PURE__ */ jsx(Outlet, {})
  ] });
}
export {
  PostsComponent as component
};
