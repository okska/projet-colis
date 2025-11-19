import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { h as authClient } from "./router-Ceaz144v.js";
import "@tanstack/react-router";
import "@tanstack/react-router-devtools";
import "better-auth/react";
import "../server.js";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "./createMiddleware-CRzJRBrm.js";
const emailPasswordAuth = authClient;
const ensureAuthSuccess = (result) => {
  if (!result) {
    throw new Error("No response from auth server.");
  }
  if (result.error) {
    const {
      message,
      status,
      statusText
    } = result.error;
    const statusInfo = status ? `${status}${statusText ? ` ${statusText}` : ""}` : statusText;
    throw new Error(message ?? (statusInfo ? `Request failed (${statusInfo})` : "Request failed"));
  }
};
function AuthPage() {
  const sessionState = authClient.useSession();
  const session = sessionState.data;
  const user = session?.user;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);
  const handleSubmit = async (action) => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setPending(action);
    setError(null);
    setStatus(null);
    try {
      const response = action === "sign-up" ? await emailPasswordAuth.signUp.email({
        email,
        password
      }) : await emailPasswordAuth.signIn.email({
        email,
        password
      });
      ensureAuthSuccess(response);
      if (action === "sign-up") {
        setStatus("Account created. Check your inbox if verification is required, then sign in.");
      } else {
        setStatus("Signed in successfully.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setPending(null);
    }
  };
  const handleSignOut = async () => {
    setPending("sign-out");
    setError(null);
    setStatus(null);
    try {
      const response = await emailPasswordAuth.signOut();
      ensureAuthSuccess(response);
      setStatus("Signed out.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign out right now.";
      setError(message);
    } finally {
      setPending(null);
    }
  };
  const isFieldsEmpty = !email || !password;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-4 max-w-md", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Better Auth" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600", children: [
        "Sign up or sign in with email. The API is served from your Hono backend at",
        " ",
        /* @__PURE__ */ jsx("code", { children: "/api/auth/*" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded border p-3", children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Session" }),
      sessionState.isPending ? /* @__PURE__ */ jsx("p", { children: "Loading session..." }) : user ? /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("p", { className: "text-green-700", children: [
          "Signed in as ",
          user.email
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600", children: [
          "User ID: ",
          user.id
        ] })
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "No active session." }),
      sessionState.error && /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-600 mt-1", children: [
        "Failed to fetch session: ",
        sessionState.error.message
      ] })
    ] }),
    /* @__PURE__ */ jsxs("form", { className: "space-y-2 rounded border p-3", onSubmit: (event) => {
      event.preventDefault();
      void handleSubmit("sign-in");
    }, children: [
      /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium", children: [
        "Email",
        /* @__PURE__ */ jsx("input", { className: "mt-1 w-full rounded border px-2 py-1", type: "email", value: email, onChange: (event) => setEmail(event.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium", children: [
        "Password",
        /* @__PURE__ */ jsx("input", { className: "mt-1 w-full rounded border px-2 py-1", type: "password", value: password, onChange: (event) => setPassword(event.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx("button", { type: "button", className: "rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-60", disabled: isFieldsEmpty || pending === "sign-in" || pending === "sign-up", onClick: () => {
          void handleSubmit("sign-in");
        }, children: pending === "sign-in" ? "Signing In…" : "Sign In" }),
        /* @__PURE__ */ jsx("button", { type: "button", className: "rounded border border-blue-600 px-3 py-1 text-blue-600 disabled:opacity-60", disabled: isFieldsEmpty || pending === "sign-in" || pending === "sign-up", onClick: () => {
          void handleSubmit("sign-up");
        }, children: pending === "sign-up" ? "Signing Up…" : "Sign Up" })
      ] }),
      user && /* @__PURE__ */ jsx("button", { type: "button", className: "rounded border border-gray-600 px-3 py-1 text-gray-700 disabled:opacity-60", disabled: pending === "sign-out", onClick: () => {
        void handleSignOut();
      }, children: pending === "sign-out" ? "Signing Out…" : "Sign Out" }),
      status && /* @__PURE__ */ jsx("p", { className: "text-sm text-green-700", children: status }),
      error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600", children: error })
    ] })
  ] });
}
export {
  AuthPage as component
};
