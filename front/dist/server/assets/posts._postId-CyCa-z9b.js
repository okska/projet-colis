import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { g as Route } from "./router-CN_V_QYt.js";
import "@tanstack/react-router-devtools";
import "../server.js";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "./createMiddleware-CRzJRBrm.js";
function PostComponent() {
  const post = Route.useLoaderData();
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx("h4", { className: "text-xl font-bold underline", children: post.title }),
    /* @__PURE__ */ jsx("div", { className: "text-sm", children: post.body }),
    /* @__PURE__ */ jsx(Link, { to: "/posts/$postId/deep", params: {
      postId: String(post.id)
    }, activeProps: {
      className: "text-black font-bold"
    }, className: "inline-block py-1 text-blue-800 hover:text-blue-600", children: "Deep View" })
  ] });
}
export {
  PostComponent as component
};
