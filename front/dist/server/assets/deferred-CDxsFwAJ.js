import { jsxs, jsx } from "react/jsx-runtime";
import { Await } from "@tanstack/react-router";
import { useState, Suspense } from "react";
import { g as Route } from "./router-Ceaz144v.js";
import "@tanstack/react-router-devtools";
import "better-auth/react";
import "../server.js";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "./createMiddleware-CRzJRBrm.js";
function Deferred() {
  const [count, setCount] = useState(0);
  const {
    deferredStuff,
    deferredPerson,
    person
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxs("div", { className: "p-2", children: [
    /* @__PURE__ */ jsxs("div", { "data-testid": "regular-person", children: [
      person.name,
      " - ",
      person.randomNumber
    ] }),
    /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { children: "Loading person..." }), children: /* @__PURE__ */ jsx(Await, { promise: deferredPerson, children: (data) => /* @__PURE__ */ jsxs("div", { "data-testid": "deferred-person", children: [
      data.name,
      " - ",
      data.randomNumber
    ] }) }) }),
    /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { children: "Loading stuff..." }), children: /* @__PURE__ */ jsx(Await, { promise: deferredStuff, children: (data) => /* @__PURE__ */ jsx("h3", { "data-testid": "deferred-stuff", children: data }) }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      "Count: ",
      count
    ] }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("button", { onClick: () => setCount(count + 1), children: "Increment" }) })
  ] });
}
export {
  Deferred as component
};
