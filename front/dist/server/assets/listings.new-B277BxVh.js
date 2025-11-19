import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { a as authClient } from "./auth-client-BMYi5sIr.js";
import { h as createListing } from "./router-CN_V_QYt.js";
import "better-auth/react";
import "@tanstack/react-router-devtools";
import "../server.js";
import "node:async_hooks";
import "@tanstack/react-router/ssr/server";
import "./createMiddleware-CRzJRBrm.js";
const clone = (value) => structuredClone(value);
function useInternalForm(options) {
  const { validators: userValidators, defaultValues, onSubmit } = options;
  const validatorsRef = useRef(userValidators ?? {});
  const onSubmitRef = useRef(onSubmit);
  const initialValuesRef = useRef(clone(defaultValues));
  const [values, setValues] = useState(() => clone(initialValuesRef.current));
  const [touched, setTouched] = useState({});
  const touchedRef = useRef({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const formApiRef = useRef(null);
  useEffect(() => {
    validatorsRef.current = userValidators ?? {};
  }, [userValidators]);
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);
  const markTouched = useCallback((updater) => {
    setTouched((prev) => {
      const next = updater(prev);
      touchedRef.current = next;
      return next;
    });
  }, []);
  const runValidator = useCallback(
    (name, value, nextValues) => {
      const validator = validatorsRef.current?.[name];
      if (!validator) {
        return [];
      }
      const message = validator(value, nextValues ?? values);
      return message ? [message] : [];
    },
    [values]
  );
  const reset = useCallback(() => {
    const nextValues = clone(initialValuesRef.current);
    setValues(nextValues);
    setErrors({});
    markTouched(() => ({}));
    setSubmitCount(0);
  }, [markTouched]);
  const setFieldValue = useCallback(
    (name, value) => {
      setValues((prev) => ({ ...prev, [name]: value }));
    },
    []
  );
  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault();
      const currentValues = values;
      const nextErrors = {};
      let hasErrors = false;
      for (const key of Object.keys(currentValues)) {
        const result = runValidator(key, currentValues[key], currentValues);
        if (result.length) {
          hasErrors = true;
          nextErrors[key] = result;
        }
      }
      setErrors(nextErrors);
      markTouched((prev) => {
        const allTouched = { ...prev };
        for (const key of Object.keys(currentValues)) {
          allTouched[key] = true;
        }
        return allTouched;
      });
      setSubmitCount((count) => count + 1);
      if (hasErrors) {
        return;
      }
      setIsSubmitting(true);
      try {
        await onSubmitRef.current?.({
          value: currentValues,
          formApi: formApiRef.current
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [markTouched, runValidator, values]
  );
  const Field = ({
    name,
    children
  }) => {
    const value = values[name];
    const isTouched = touchedRef.current[name] ?? false;
    const fieldErrors = errors[name] ?? [];
    const handleBlur = () => {
      markTouched((prev) => ({ ...prev, [name]: true }));
      setErrors((prev) => ({
        ...prev,
        [name]: runValidator(name, values[name], values)
      }));
    };
    const handleChange = (nextValue) => {
      setValues((prev) => {
        const nextValues = { ...prev, [name]: nextValue };
        if (touchedRef.current[name]) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: runValidator(name, nextValue, nextValues)
          }));
        }
        return nextValues;
      });
    };
    return /* @__PURE__ */ jsx(Fragment, { children: children({
      name,
      state: {
        value,
        meta: {
          isDirty: !Object.is(value, initialValuesRef.current[name]),
          isTouched,
          touchedErrors: isTouched ? fieldErrors : []
        }
      },
      handleBlur,
      handleChange,
      setValue: (nextValue) => {
        setValues((prev) => ({ ...prev, [name]: nextValue }));
      }
    }) });
  };
  const isDirty = useMemo(() => {
    const keys = Object.keys(initialValuesRef.current);
    return keys.some((key) => !Object.is(values[key], initialValuesRef.current[key]));
  }, [values]);
  const formApi = {
    Field,
    handleSubmit,
    reset,
    setFieldValue,
    state: {
      values,
      errors,
      touched,
      isDirty,
      isSubmitting,
      submitCount
    }
  };
  formApiRef.current = formApi;
  return formApi;
}
function createForm(options) {
  const formApi = useInternalForm(options);
  const latestFormApiRef = useRef(formApi);
  latestFormApiRef.current = formApi;
  const subscribeImpl = ({
    selector,
    children
  }) => {
    const selected = selector(latestFormApiRef.current.state);
    return /* @__PURE__ */ jsx(Fragment, { children: children(selected) });
  };
  const fieldWrapperRef = useRef(null);
  const subscribeWrapperRef = useRef(null);
  if (!fieldWrapperRef.current) {
    fieldWrapperRef.current = ((props) => latestFormApiRef.current.Field(props));
  }
  if (!subscribeWrapperRef.current) {
    subscribeWrapperRef.current = subscribeImpl;
  }
  const stableFormRef = useRef(null);
  if (!stableFormRef.current) {
    stableFormRef.current = {
      ...formApi,
      Field: fieldWrapperRef.current,
      Subscribe: subscribeWrapperRef.current
    };
  } else {
    Object.assign(stableFormRef.current, formApi);
    stableFormRef.current.Field = fieldWrapperRef.current;
    stableFormRef.current.Subscribe = subscribeWrapperRef.current;
  }
  return stableFormRef.current;
}
function NewListingPage() {
  const navigate = useNavigate();
  const sessionState = authClient.useSession();
  const user = sessionState.data?.user;
  const [statusMessage, setStatusMessage] = useState({
    intent: null
  });
  const form = createForm({
    defaultValues: {
      title: "",
      shortDescription: "",
      pickupAddress: "",
      deliveryAddress: "",
      budget: "50",
      currency: "EUR",
      pickupWindowStart: "",
      pickupWindowEnd: ""
    },
    validators: {
      title: (value) => value.trim().length === 0 ? "Le titre est requis." : void 0,
      pickupAddress: (value) => value.trim().length === 0 ? "Adresse de retrait requise." : void 0,
      deliveryAddress: (value) => value.trim().length === 0 ? "Adresse de livraison requise." : void 0,
      budget: (value) => Number(value) > 0 ? void 0 : "Le budget doit être supérieur à 0.",
      pickupWindowStart: (value, values) => {
        if (!value || !values.pickupWindowEnd) {
          return void 0;
        }
        const startTime = Date.parse(value);
        const endTime = Date.parse(values.pickupWindowEnd);
        if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
          return "Fenêtre de retrait invalide.";
        }
        return startTime < endTime ? void 0 : "Le début doit être antérieur à la fin.";
      },
      pickupWindowEnd: (value, values) => {
        if (!value || !values.pickupWindowStart) {
          return void 0;
        }
        const startTime = Date.parse(values.pickupWindowStart);
        const endTime = Date.parse(value);
        if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
          return "Fenêtre de retrait invalide.";
        }
        return endTime > startTime ? void 0 : "La fin doit être postérieure au début.";
      }
    },
    onSubmit: async ({
      value,
      formApi
    }) => {
      if (!user) {
        setStatusMessage({
          intent: "error",
          text: "Veuillez vous connecter pour créer un listing."
        });
        return;
      }
      setStatusMessage({
        intent: null
      });
      const payload = {
        title: value.title.trim(),
        shortDescription: value.shortDescription?.trim() || void 0,
        pickupAddress: value.pickupAddress.trim(),
        deliveryAddress: value.deliveryAddress.trim(),
        budget: Number(value.budget) || 0,
        currency: value.currency,
        pickupWindowStart: value.pickupWindowStart || void 0,
        pickupWindowEnd: value.pickupWindowEnd || void 0
      };
      const result = await createListing(payload);
      setStatusMessage({
        intent: result.ok ? "success" : "error",
        text: result.message
      });
      if (result.ok) {
        formApi.reset();
        setTimeout(() => {
          navigate({
            to: "/listings"
          });
        }, 350);
      }
    }
  });
  return /* @__PURE__ */ jsxs("section", { className: "space-y-6 p-4", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 uppercase tracking-wide", children: "Nouveau listing" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Publier une livraison" })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/listings", className: "rounded-md border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50", children: "Retour aux listings" })
    ] }),
    !user ? /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900", children: [
      "Vous devez être connecté pour publier une livraison. Rendez-vous sur",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/auth", className: "font-medium underline", children: "la page d’authentification" }),
      " ",
      "pour créer un compte ou vous connecter."
    ] }) : null,
    /* @__PURE__ */ jsxs("form", { onSubmit: (event) => {
      void form.handleSubmit(event);
    }, className: "space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsx(form.Field, { name: "title", children: (field) => /* @__PURE__ */ jsx(FormField, { label: "Titre", required: true, error: field.state.meta.touchedErrors[0], children: /* @__PURE__ */ jsx("input", { type: "text", value: field.state.value, onChange: (event) => field.handleChange(event.target.value), onBlur: field.handleBlur, className: "w-full rounded-md border border-slate-300 px-3 py-2", placeholder: "Colis Bordeaux → Toulouse" }) }) }),
        /* @__PURE__ */ jsx(form.Field, { name: "budget", children: (field) => /* @__PURE__ */ jsx(FormField, { label: "Budget estimé (EUR)", required: true, error: field.state.meta.touchedErrors[0], children: /* @__PURE__ */ jsx("input", { type: "number", min: 1, step: 5, value: field.state.value, onChange: (event) => field.handleChange(event.target.value), onBlur: field.handleBlur, className: "w-full rounded-md border border-slate-300 px-3 py-2" }) }) })
      ] }),
      /* @__PURE__ */ jsx(form.Field, { name: "shortDescription", children: (field) => /* @__PURE__ */ jsx(FormField, { label: "Description rapide", children: /* @__PURE__ */ jsx("textarea", { value: field.state.value, onChange: (event) => field.handleChange(event.target.value), onBlur: field.handleBlur, rows: 3, className: "w-full rounded-md border border-slate-300 px-3 py-2", placeholder: "Précisez la nature du colis, sa fragilité, les documents à fournir..." }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsx(form.Field, { name: "pickupAddress", children: (field) => /* @__PURE__ */ jsx(FormField, { label: "Adresse de retrait", required: true, error: field.state.meta.touchedErrors[0], children: /* @__PURE__ */ jsx("input", { type: "text", value: field.state.value, onChange: (event) => field.handleChange(event.target.value), onBlur: field.handleBlur, className: "w-full rounded-md border border-slate-300 px-3 py-2", placeholder: "12 Rue de la République, 69002 Lyon" }) }) }),
        /* @__PURE__ */ jsx(form.Field, { name: "deliveryAddress", children: (field) => /* @__PURE__ */ jsx(FormField, { label: "Adresse de livraison", required: true, error: field.state.meta.touchedErrors[0], children: /* @__PURE__ */ jsx("input", { type: "text", value: field.state.value, onChange: (event) => field.handleChange(event.target.value), onBlur: field.handleBlur, className: "w-full rounded-md border border-slate-300 px-3 py-2", placeholder: "5 Rue Sainte-Catherine, 33000 Bordeaux" }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsx(form.Field, { name: "pickupWindowStart", children: (field) => /* @__PURE__ */ jsx(FormField, { label: "Début de fenêtre de retrait", children: /* @__PURE__ */ jsx("input", { type: "datetime-local", value: field.state.value, onChange: (event) => field.handleChange(event.target.value), onBlur: field.handleBlur, className: "w-full rounded-md border border-slate-300 px-3 py-2" }) }) }),
        /* @__PURE__ */ jsx(form.Field, { name: "pickupWindowEnd", children: (field) => /* @__PURE__ */ jsx(FormField, { label: "Fin de fenêtre de retrait", children: /* @__PURE__ */ jsx("input", { type: "datetime-local", value: field.state.value, onChange: (event) => field.handleChange(event.target.value), onBlur: field.handleBlur, className: "w-full rounded-md border border-slate-300 px-3 py-2" }) }) })
      ] }),
      /* @__PURE__ */ jsx(form.Field, { name: "currency", children: (field) => /* @__PURE__ */ jsx(FormField, { label: "Devise", children: /* @__PURE__ */ jsxs("select", { value: field.state.value, onChange: (event) => field.handleChange(event.target.value), onBlur: field.handleBlur, className: "w-full rounded-md border border-slate-300 px-3 py-2", children: [
        /* @__PURE__ */ jsx("option", { value: "EUR", children: "€ Euro" }),
        /* @__PURE__ */ jsx("option", { value: "USD", children: "$ Dollar" }),
        /* @__PURE__ */ jsx("option", { value: "GBP", children: "£ Livre sterling" })
      ] }) }) }),
      statusMessage.intent && /* @__PURE__ */ jsx("p", { className: `rounded-md px-3 py-2 text-sm ${statusMessage.intent === "success" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`, children: statusMessage.text }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3 md:flex-row md:justify-end", children: /* @__PURE__ */ jsx(form.Subscribe, { selector: (state) => [state.isSubmitting], children: ([isSubmitting]) => /* @__PURE__ */ jsx("button", { type: "submit", disabled: isSubmitting || !user, className: "inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-2 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400", children: isSubmitting ? "Création en cours..." : user ? "Publier le listing" : "Connectez-vous pour publier" }) }) })
    ] })
  ] });
}
function FormField({
  label,
  required,
  error,
  children
}) {
  return /* @__PURE__ */ jsxs("label", { className: "space-y-2 text-sm", children: [
    /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-slate-700", children: [
      label,
      required ? /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase text-rose-600", children: "*" }) : null
    ] }),
    children,
    error ? /* @__PURE__ */ jsx("span", { className: "text-xs text-rose-600", children: error }) : null
  ] });
}
export {
  NewListingPage as component
};
