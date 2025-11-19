import { jsx } from "react/jsx-runtime";
import { N as NotFound } from "./router-CN_V_QYt.js";
import "@tanstack/react-router";
import "@tanstack/react-router-devtools";
import "../server.js";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "./createMiddleware-CRzJRBrm.js";
const SplitNotFoundComponent = () => {
  return /* @__PURE__ */ jsx(NotFound, { children: "Post not found" });
};
export {
  SplitNotFoundComponent as notFoundComponent
};
