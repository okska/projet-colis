import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useRouter, useMatch, rootRouteId, ErrorComponent, Link, createRootRouteWithContext, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, notFound, createRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createAuthClient } from "better-auth/react";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn, j as json, a as getRequestHeaders } from "../server.js";
import { c as createMiddleware } from "./createMiddleware-CRzJRBrm.js";
function DefaultCatchBoundary({ error }) {
  const router2 = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId
  });
  console.error("DefaultCatchBoundary Error:", error);
  return /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6", children: [
    /* @__PURE__ */ jsx(ErrorComponent, { error }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center flex-wrap", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
          },
          className: `px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`,
          children: "Try Again"
        }
      ),
      isRoot ? /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: `px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`,
          children: "Home"
        }
      ) : /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: `px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`,
          onClick: (e) => {
            e.preventDefault();
            window.history.back();
          },
          children: "Go Back"
        }
      )
    ] })
  ] });
}
function NotFound({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2 p-2", children: [
    /* @__PURE__ */ jsx("div", { className: "text-gray-600 dark:text-gray-400", children: children || /* @__PURE__ */ jsx("p", { children: "The page you are looking for does not exist." }) }),
    /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.history.back(),
          className: "bg-emerald-500 text-white px-2 py-1 rounded-sm uppercase font-black text-sm",
          children: "Go back"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: "bg-cyan-600 text-white px-2 py-1 rounded-sm uppercase font-black text-sm",
          children: "Start Over"
        }
      )
    ] })
  ] });
}
const appCss = "/assets/app-Bd0ot26M.css";
const seo = ({
  title,
  description,
  keywords,
  image
}) => {
  const tags = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:creator", content: "@tannerlinsley" },
    { name: "twitter:site", content: "@tannerlinsley" },
    { name: "og:type", content: "website" },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    ...image ? [
      { name: "twitter:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "og:image", content: image }
    ] : []
  ];
  return tags;
};
const baseURL = "http://localhost:3000";
const authClient = createAuthClient({
  baseURL
});
const apiUrl$4 = "http://localhost:3000";
async function fetchDriverStatus(options) {
  const headers = void 0;
  const response = await fetch(`${apiUrl$4}/api/me/driver-status`, {
    credentials: "include",
    headers
  });
  if (response.status === 401) {
    throw Object.assign(new Error("Authentification requise."), {
      status: response.status
    });
  }
  if (!response.ok) {
    throw new Error("Impossible de récupérer le statut livreur.");
  }
  return await response.json();
}
const Route$q = createRootRouteWithContext()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      ...seo({
        title: "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `
      })
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png"
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" }
    ],
    scripts: [
      {
        src: "/customScript.js",
        type: "text/javascript"
      }
    ]
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => /* @__PURE__ */ jsx(NotFound, {}),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(NavLinks, {}),
      /* @__PURE__ */ jsx("hr", {}),
      children,
      /* @__PURE__ */ jsx(TanStackRouterDevtools, { position: "bottom-right" }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function NavLinks() {
  const session = authClient.useSession();
  const userId = session.data?.user.id;
  const [isDriver, setIsDriver] = useState(false);
  useEffect(() => {
    if (!userId) {
      setIsDriver(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const status = await fetchDriverStatus();
        if (!cancelled) {
          setIsDriver(status.isDriver);
        }
      } catch {
        if (!cancelled) {
          setIsDriver(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);
  return /* @__PURE__ */ jsxs("div", { className: "p-2 flex gap-2 text-lg", children: [
    /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        activeProps: {
          className: "font-bold"
        },
        activeOptions: { exact: true },
        children: "Home"
      }
    ),
    " ",
    /* @__PURE__ */ jsx(
      Link,
      {
        to: "/listings",
        activeProps: {
          className: "font-bold"
        },
        children: "Listings"
      }
    ),
    " ",
    isDriver && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/mes-livraisons",
          activeProps: {
            className: "font-bold"
          },
          children: "Mes livraisons"
        }
      ),
      " "
    ] }),
    /* @__PURE__ */ jsx(
      Link,
      {
        to: "/admin/users",
        activeProps: {
          className: "font-bold"
        },
        children: "Admin"
      }
    ),
    " ",
    /* @__PURE__ */ jsx(
      Link,
      {
        to: "/auth",
        activeProps: {
          className: "font-bold"
        },
        children: "Auth"
      }
    ),
    " "
  ] });
}
const $$splitComponentImporter$k = () => import("./users-B3Jy8_90.js");
const Route$p = createFileRoute("/users")({
  loader: async () => {
    const res = await fetch("/api/users");
    if (!res.ok) {
      throw new Error("Unexpected status code");
    }
    const data = await res.json();
    return data;
  },
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const Route$o = createFileRoute("/redirect")({
  beforeLoad: () => {
    throw redirect({
      to: "/posts"
    });
  }
});
const $$splitComponentImporter$j = () => import("./posts2-Cu9QlfSd.js");
const Route$n = createFileRoute("/posts2")({
  loader: async () => fetchPosts2(),
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const apiUrl$3 = "http://localhost:3000";
async function fetchPosts2() {
  console.info("Fetching posts2 from Hono backend using Drizzle...");
  const res = await fetch(`${apiUrl$3}/api/posts2`);
  if (!res.ok) {
    throw new Error("Failed to fetch posts2");
  }
  const posts = await res.json();
  return posts;
}
const apiUrl$2 = "http://localhost:3000";
const fetchPost = async (postId) => {
  console.info(`Fetching post with id ${postId} from Hono backend...`);
  const res = await fetch(`${apiUrl$2}/api/posts/${postId}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw notFound();
    }
    throw new Error("Failed to fetch post");
  }
  const post = await res.json();
  return post;
};
const fetchPosts = async () => {
  console.info("Fetching posts from Hono backend...");
  const res = await fetch(`${apiUrl$2}/api/posts`);
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  const posts = await res.json();
  return posts.slice(0, 10);
};
const $$splitComponentImporter$i = () => import("./posts-CInLUCb_.js");
const Route$m = createFileRoute("/posts")({
  loader: async () => fetchPosts(),
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const apiUrl$1 = "http://localhost:3000";
const listingStatusLabels = {
  draft: "Brouillon",
  published: "Publié",
  assigned: "Assigné",
  ready_for_pickup: "Prêt pour retrait",
  in_transit: "En cours",
  delivered: "Livré",
  cancelled: "Annulé",
  disputed: "En litige",
  archived: "Archivé"
};
const sampleListings = [
  {
    id: "demo-1",
    title: "Colis médical Nantes → Paris",
    shortDescription: "Livraison urgente de documents médicaux scellés.",
    pickupAddress: "12 Rue Paul Bellamy, 44000 Nantes",
    deliveryAddress: "45 Rue de Turbigo, 75003 Paris",
    status: "published",
    budget: 85,
    currency: "EUR",
    pickupWindow: {
      start: new Date(Date.now() + 60 * 60 * 1e3).toISOString(),
      end: new Date(Date.now() + 3 * 60 * 60 * 1e3).toISOString()
    },
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    ownerId: "demo-expediteur"
  },
  {
    id: "demo-2",
    title: "Carton fragile Lyon → Marseille",
    shortDescription: "Vases artisanaux, emballage fourni sur place.",
    pickupAddress: "5 Quai des Célestins, 69002 Lyon",
    deliveryAddress: "17 Rue Sainte, 13001 Marseille",
    status: "assigned",
    budget: 120,
    currency: "EUR",
    pickupWindow: {
      start: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString(),
      end: new Date(Date.now() + 27 * 60 * 60 * 1e3).toISOString()
    },
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    ownerId: "demo-expediteur-2"
  }
];
async function fetchListings(options) {
  const headers = options?.cookie ? { cookie: options.cookie } : void 0;
  try {
    const res = await fetch(`${apiUrl$1}/api/listings`, {
      credentials: "include",
      headers
    });
    if (!res.ok) {
      throw new Error("Unable to fetch listings");
    }
    return await res.json();
  } catch (error) {
    console.warn(
      "[listings] Impossible de contacter le backend, utilisation des données de démonstration.",
      error
    );
    return sampleListings;
  }
}
async function fetchPublicListings() {
  try {
    const res = await fetch(`${apiUrl$1}/api/listings/public`);
    if (!res.ok) {
      throw new Error("Unable to fetch listings");
    }
    return await res.json();
  } catch (error) {
    console.warn(
      "[listings] Impossible de charger les listings publics, utilisation des données de démonstration.",
      error
    );
    return sampleListings;
  }
}
async function requestListingDelivery(listingId) {
  const response = await fetch(
    `${apiUrl$1}/api/listings/${listingId}/request-delivery`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    }
  );
  return handleDeliveryResponse(response);
}
async function cancelListingDelivery(listingId) {
  const response = await fetch(
    `${apiUrl$1}/api/listings/${listingId}/request-delivery`,
    {
      method: "DELETE",
      credentials: "include"
    }
  );
  return handleDeliveryResponse(response);
}
async function fetchDriverDeliveryRequests(options) {
  const headers = void 0;
  const response = await fetch(`${apiUrl$1}/api/listings/delivery-requests`, {
    credentials: "include",
    headers
  });
  if (!response.ok) {
    throw new Error("Impossible de récupérer vos demandes de livraison.");
  }
  const data = await response.json();
  return data.listingIds;
}
async function fetchListingRequests(listingId) {
  const response = await fetch(
    `${apiUrl$1}/api/listings/${listingId}/delivery-requests`,
    {
      credentials: "include"
    }
  );
  const parsed = await tryParseJson(response);
  if (response.status === 401) {
    throw new Error("Veuillez vous connecter pour voir les offres.");
  }
  if (response.status === 403) {
    throw new Error("Seul le propriétaire du listing peut voir les offres.");
  }
  if (!response.ok) {
    const message = typeof parsed?.error === "string" ? parsed.error : "Impossible de récupérer les offres des livreurs.";
    throw new Error(message);
  }
  return parsed ?? [];
}
async function acceptListingRequest(listingId, requestId) {
  const response = await fetch(
    `${apiUrl$1}/api/listings/${listingId}/delivery-requests/${requestId}/accept`,
    {
      method: "POST",
      credentials: "include"
    }
  );
  const parsed = await tryParseJson(response);
  if (response.status === 401) {
    throw new Error("Veuillez vous connecter pour effectuer cette action.");
  }
  if (response.status === 403) {
    throw new Error("Seul le propriétaire du listing peut accepter une offre.");
  }
  if (!response.ok) {
    const message = typeof parsed?.error === "string" ? parsed.error : "Impossible d’accepter cette offre.";
    throw new Error(message);
  }
  return parsed ?? { message: "Demande acceptée." };
}
async function fetchDriverAssignments(options) {
  const headers = options?.cookie ? { cookie: options.cookie } : void 0;
  const response = await fetch(`${apiUrl$1}/api/driver/delivery-requests`, {
    credentials: "include",
    headers
  });
  if (response.status === 401) {
    throw new Error("Veuillez vous connecter pour accéder à vos livraisons.");
  }
  if (response.status === 403) {
    throw new Error("Profil livreur requis pour consulter cette page.");
  }
  if (!response.ok) {
    throw new Error("Impossible de récupérer vos livraisons.");
  }
  return await response.json();
}
async function handleDeliveryResponse(response) {
  const parsed = await tryParseJson(response);
  if (response.status === 401) {
    throw new Error("Veuillez vous connecter pour effectuer cette action.");
  }
  if (response.status === 403) {
    throw new Error("Seuls les livreurs peuvent effectuer cette action.");
  }
  if (!response.ok) {
    const message = typeof parsed?.error === "string" ? parsed.error : "Impossible de soumettre la demande pour le moment.";
    throw new Error(message);
  }
  return parsed ?? { message: "Action réalisée." };
}
async function tryParseJson(response) {
  try {
    return await response.clone().json();
  } catch {
    return void 0;
  }
}
async function createListing(data) {
  const payload = {
    title: data.title,
    short_description: data.shortDescription,
    pickup_address: data.pickupAddress,
    delivery_address: data.deliveryAddress,
    budget: data.budget,
    currency: data.currency,
    pickup_window: data.pickupWindowStart && data.pickupWindowEnd ? {
      start: new Date(data.pickupWindowStart).toISOString(),
      end: new Date(data.pickupWindowEnd).toISOString()
    } : void 0
  };
  try {
    const res = await fetch(`${apiUrl$1}/api/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      let errorMessage = "Impossible de créer le listing.";
      try {
        const errorBody = await res.json();
        if (typeof errorBody?.error === "string") {
          errorMessage = errorBody.error;
        }
      } catch {
        const text = await res.text();
        if (text) {
          errorMessage = text;
        }
      }
      throw new Error(errorMessage);
    }
    const created = await res.json();
    return {
      ok: true,
      message: "Listing créé avec succès.",
      listing: created
    };
  } catch (error) {
    console.warn("[listings] Impossible de créer le listing.", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Impossible de créer le listing pour le moment."
    };
  }
}
const $$splitComponentImporter$h = () => import("./mes-livraisons-rKoN1IbQ.js");
const Route$l = createFileRoute("/mes-livraisons")({
  loader: async ({
    context
  }) => {
    const runningOnServer = typeof document === "undefined";
    const cookie = runningOnServer ? context?.serverContext?.request?.headers.get("cookie") ?? void 0 : void 0;
    const assignments = await fetchDriverAssignments({
      cookie
    });
    return {
      assignments
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./mes-listings-B6zKpOhd.js");
const Route$k = createFileRoute("/mes-listings")({
  loader: async ({
    context
  }) => {
    const runningOnServer = typeof document === "undefined";
    const serverCookie = runningOnServer ? context?.serverContext?.request?.headers.get("cookie") ?? void 0 : void 0;
    if (runningOnServer && !serverCookie) {
      return {
        listings: [],
        needsClientFetch: true
      };
    }
    const listings = await fetchListings({
      cookie: serverCookie
    });
    return {
      listings,
      needsClientFetch: false
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./listings-C7DA9vBh.js");
const Route$j = createFileRoute("/listings")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const fn = async (...args) => {
    const serverFn = await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    functionId,
    [TSS_SERVER_FUNCTION]: true
  });
};
const $$splitComponentImporter$e = () => import("./deferred-CDxsFwAJ.js");
const personServerFn_createServerFn_handler = createSsrRpc("f76e8f8721c12c8547a3ced6a10916f5b5076c1a10dcbeaa607360ce419d0a48");
const personServerFn = createServerFn({
  method: "GET"
}).inputValidator((d) => d).handler(personServerFn_createServerFn_handler, ({
  data: name
}) => {
  return {
    name,
    randomNumber: Math.floor(Math.random() * 100)
  };
});
const slowServerFn_createServerFn_handler = createSsrRpc("fc3988c64f434639dfd4eab3f926b87ee39cc0c14f65b4d0e852c7fd73279a3b");
const slowServerFn = createServerFn({
  method: "GET"
}).inputValidator((d) => d).handler(slowServerFn_createServerFn_handler, async ({
  data: name
}) => {
  await new Promise((r) => setTimeout(r, 1e3));
  return {
    name,
    randomNumber: Math.floor(Math.random() * 100)
  };
});
const Route$i = createFileRoute("/deferred")({
  loader: async () => {
    return {
      deferredStuff: new Promise((r) => setTimeout(() => r("Hello deferred!"), 2e3)),
      deferredPerson: slowServerFn({
        data: "Tanner Linsley"
      }),
      person: await personServerFn({
        data: "John Doe"
      })
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const Route$h = createFileRoute("/customScript.js")({
  server: {
    handlers: {
      GET: () => {
        return new Response('console.log("Hello from customScript.js!")', {
          headers: {
            "Content-Type": "application/javascript"
          }
        });
      }
    }
  }
});
const $$splitComponentImporter$d = () => import("./auth-xlYYLu46.js");
const Route$g = createFileRoute("/auth")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./_pathlessLayout-BhrcpZGS.js");
const Route$f = createFileRoute("/_pathlessLayout")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./index-CgEsgH9O.js");
const Route$e = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./users.index-Bef-9o5f.js");
const Route$d = createFileRoute("/users/")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./posts.index-DU8oxB5n.js");
const Route$c = createFileRoute("/posts/")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./listings.index-CO8AYBgb.js");
const Route$b = createFileRoute("/listings/")({
  loader: async () => {
    const listings = await fetchPublicListings();
    return {
      listings
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitNotFoundComponentImporter$1 = () => import("./users._userId-CQ2T9j5L.js");
const $$splitComponentImporter$7 = () => import("./users._userId-Kf_4U-Pb.js");
const $$splitErrorComponentImporter$2 = () => import("./users._userId-CG2IqJzb.js");
const Route$a = createFileRoute("/users/$userId")({
  loader: async ({
    params: {
      userId
    }
  }) => {
    try {
      const res = await fetch("/api/users/" + userId);
      if (!res.ok) {
        throw new Error("Unexpected status code");
      }
      const data = await res.json();
      return data;
    } catch {
      throw new Error("Failed to fetch user");
    }
  },
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$2, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$7, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$1, "notFoundComponent")
});
const $$splitNotFoundComponentImporter = () => import("./posts._postId-DPMnjjMV.js");
const $$splitComponentImporter$6 = () => import("./posts._postId-DlOPomtS.js");
const $$splitErrorComponentImporter$1 = () => import("./posts._postId-C9z5TBp-.js");
const Route$9 = createFileRoute("/posts/$postId")({
  loader: ({
    params: {
      postId
    }
  }) => fetchPost(postId),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$6, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
const $$splitComponentImporter$5 = () => import("./listings.new-C7iw7Em-.js");
const Route$8 = createFileRoute("/listings/new")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const userLoggerMiddleware = createMiddleware().server(async ({
  next
}) => {
  console.info("In: /users");
  console.info("Request Headers:", getRequestHeaders());
  const result = await next();
  result.response.headers.set("x-users", "true");
  console.info("Out: /users");
  return result;
});
const testParentMiddleware = createMiddleware().server(async ({
  next
}) => {
  console.info("In: testParentMiddleware");
  const result = await next();
  result.response.headers.set("x-test-parent", "true");
  console.info("Out: testParentMiddleware");
  return result;
});
const testMiddleware = createMiddleware().middleware([testParentMiddleware]).server(async ({
  next
}) => {
  console.info("In: testMiddleware");
  const result = await next();
  result.response.headers.set("x-test", "true");
  console.info("Out: testMiddleware");
  return result;
});
const Route$7 = createFileRoute("/api/users")({
  server: {
    middleware: [testMiddleware, userLoggerMiddleware],
    handlers: {
      GET: async ({
        request
      }) => {
        console.info("GET /api/users @", request.url);
        console.info("Fetching users... @", request.url);
        const res = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await res.json();
        const list = data.slice(0, 10);
        return json(list.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email
        })));
      }
    }
  }
});
const apiUrl = "http://localhost:3000";
async function fetchAdminUsers(options) {
  const headers = options?.cookie ? { cookie: options.cookie } : void 0;
  const response = await fetch(`${apiUrl}/api/admin/users`, {
    credentials: "include",
    headers
  });
  if (response.status === 401 || response.status === 403) {
    const error = new Error("Accès refusé.");
    error.status = response.status;
    throw error;
  }
  if (!response.ok) {
    throw new Error("Impossible de récupérer les utilisateurs.");
  }
  return await response.json();
}
async function promoteUserToDriver(userId) {
  const response = await fetch(`${apiUrl}/api/admin/users/${userId}/driver`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (response.status === 401 || response.status === 403) {
    const error = new Error("Accès refusé.");
    error.status = response.status;
    throw error;
  }
  if (!response.ok) {
    let message = "Impossible de mettre à jour le profil livreur.";
    try {
      const body = await response.json();
      if (body?.error && typeof body.error === "string") {
        message = body.error;
      }
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
    throw new Error(message);
  }
  return await response.json();
}
const $$splitComponentImporter$4 = () => import("./admin.users-D7sMkiAj.js");
const Route$6 = createFileRoute("/admin/users")({
  loader: async ({
    context
  }) => {
    const isServer = typeof document === "undefined";
    const cookie = isServer ? context?.serverContext?.request?.headers.get("cookie") ?? void 0 : void 0;
    try {
      const users = await fetchAdminUsers({
        cookie
      });
      return {
        allowed: true,
        users,
        needsClientFetch: false
      };
    } catch (error) {
      const status = error?.status;
      if (status === 401 || status === 403) {
        if (isServer && !cookie) {
          return {
            allowed: false,
            users: [],
            needsClientFetch: true
          };
        }
        return {
          allowed: false,
          users: [],
          needsClientFetch: false
        };
      }
      throw error;
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./_nested-layout-BocDAsiI.js");
const Route$5 = createFileRoute("/_pathlessLayout/_nested-layout")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./posts_._postId.deep-CvVdhF0S.js");
const $$splitErrorComponentImporter = () => import("./posts_._postId.deep-C9z5TBp-.js");
const Route$4 = createFileRoute("/posts_/$postId/deep")({
  loader: async ({
    params: {
      postId
    }
  }) => fetchPost(postId),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const Route$3 = createFileRoute("/api/users/$userId")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        console.info(`Fetching users by id=${params.userId}... @`, request.url);
        try {
          const res = await fetch(
            "https://jsonplaceholder.typicode.com/users/" + params.userId
          );
          if (!res.ok) {
            throw new Error("Failed to fetch user");
          }
          const user = await res.json();
          return json({
            id: user.id,
            name: user.name,
            email: user.email
          });
        } catch (e) {
          console.error(e);
          return json({ error: "User not found" }, { status: 404 });
        }
      }
    }
  }
});
const backendBaseUrl = process.env.BACKEND_BASE_URL ?? process.env.VITE_API_URL ?? "http://localhost:3000";
async function proxyAuthRequest(request) {
  const incomingUrl = new URL(request.url);
  const suffix = incomingUrl.pathname.replace(/^\/api\/auth\//, "");
  const targetUrl = new URL(`/api/auth/${suffix}`, backendBaseUrl);
  targetUrl.search = incomingUrl.search;
  const proxiedRequest = new Request(targetUrl, request);
  return fetch(proxiedRequest);
}
const Route$2 = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      ANY: ({ request }) => proxyAuthRequest(request)
    }
  }
});
const $$splitComponentImporter$1 = () => import("./route-b-CsHX6n6-.js");
const Route$1 = createFileRoute("/_pathlessLayout/_nested-layout/route-b")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./route-a-xd-e2Wm0.js");
const Route = createFileRoute("/_pathlessLayout/_nested-layout/route-a")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const UsersRoute = Route$p.update({
  id: "/users",
  path: "/users",
  getParentRoute: () => Route$q
});
const RedirectRoute = Route$o.update({
  id: "/redirect",
  path: "/redirect",
  getParentRoute: () => Route$q
});
const Posts2Route = Route$n.update({
  id: "/posts2",
  path: "/posts2",
  getParentRoute: () => Route$q
});
const PostsRoute = Route$m.update({
  id: "/posts",
  path: "/posts",
  getParentRoute: () => Route$q
});
const MesLivraisonsRoute = Route$l.update({
  id: "/mes-livraisons",
  path: "/mes-livraisons",
  getParentRoute: () => Route$q
});
const MesListingsRoute = Route$k.update({
  id: "/mes-listings",
  path: "/mes-listings",
  getParentRoute: () => Route$q
});
const ListingsRoute = Route$j.update({
  id: "/listings",
  path: "/listings",
  getParentRoute: () => Route$q
});
const DeferredRoute = Route$i.update({
  id: "/deferred",
  path: "/deferred",
  getParentRoute: () => Route$q
});
const CustomScriptDotjsRoute = Route$h.update({
  id: "/customScript.js",
  path: "/customScript.js",
  getParentRoute: () => Route$q
});
const AuthRoute = Route$g.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$q
});
const PathlessLayoutRoute = Route$f.update({
  id: "/_pathlessLayout",
  getParentRoute: () => Route$q
});
const IndexRoute = Route$e.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$q
});
const UsersIndexRoute = Route$d.update({
  id: "/",
  path: "/",
  getParentRoute: () => UsersRoute
});
const PostsIndexRoute = Route$c.update({
  id: "/",
  path: "/",
  getParentRoute: () => PostsRoute
});
const ListingsIndexRoute = Route$b.update({
  id: "/",
  path: "/",
  getParentRoute: () => ListingsRoute
});
const UsersUserIdRoute = Route$a.update({
  id: "/$userId",
  path: "/$userId",
  getParentRoute: () => UsersRoute
});
const PostsPostIdRoute = Route$9.update({
  id: "/$postId",
  path: "/$postId",
  getParentRoute: () => PostsRoute
});
const ListingsNewRoute = Route$8.update({
  id: "/new",
  path: "/new",
  getParentRoute: () => ListingsRoute
});
const ApiUsersRoute = Route$7.update({
  id: "/api/users",
  path: "/api/users",
  getParentRoute: () => Route$q
});
const AdminUsersRoute = Route$6.update({
  id: "/admin/users",
  path: "/admin/users",
  getParentRoute: () => Route$q
});
const PathlessLayoutNestedLayoutRoute = Route$5.update({
  id: "/_nested-layout",
  getParentRoute: () => PathlessLayoutRoute
});
const PostsPostIdDeepRoute = Route$4.update({
  id: "/posts_/$postId/deep",
  path: "/posts/$postId/deep",
  getParentRoute: () => Route$q
});
const ApiUsersUserIdRoute = Route$3.update({
  id: "/$userId",
  path: "/$userId",
  getParentRoute: () => ApiUsersRoute
});
const ApiAuthSplatRoute = Route$2.update({
  id: "/api/auth/$",
  path: "/api/auth/$",
  getParentRoute: () => Route$q
});
const PathlessLayoutNestedLayoutRouteBRoute = Route$1.update({
  id: "/route-b",
  path: "/route-b",
  getParentRoute: () => PathlessLayoutNestedLayoutRoute
});
const PathlessLayoutNestedLayoutRouteARoute = Route.update({
  id: "/route-a",
  path: "/route-a",
  getParentRoute: () => PathlessLayoutNestedLayoutRoute
});
const PathlessLayoutNestedLayoutRouteChildren = {
  PathlessLayoutNestedLayoutRouteARoute,
  PathlessLayoutNestedLayoutRouteBRoute
};
const PathlessLayoutNestedLayoutRouteWithChildren = PathlessLayoutNestedLayoutRoute._addFileChildren(
  PathlessLayoutNestedLayoutRouteChildren
);
const PathlessLayoutRouteChildren = {
  PathlessLayoutNestedLayoutRoute: PathlessLayoutNestedLayoutRouteWithChildren
};
const PathlessLayoutRouteWithChildren = PathlessLayoutRoute._addFileChildren(
  PathlessLayoutRouteChildren
);
const ListingsRouteChildren = {
  ListingsNewRoute,
  ListingsIndexRoute
};
const ListingsRouteWithChildren = ListingsRoute._addFileChildren(
  ListingsRouteChildren
);
const PostsRouteChildren = {
  PostsPostIdRoute,
  PostsIndexRoute
};
const PostsRouteWithChildren = PostsRoute._addFileChildren(PostsRouteChildren);
const UsersRouteChildren = {
  UsersUserIdRoute,
  UsersIndexRoute
};
const UsersRouteWithChildren = UsersRoute._addFileChildren(UsersRouteChildren);
const ApiUsersRouteChildren = {
  ApiUsersUserIdRoute
};
const ApiUsersRouteWithChildren = ApiUsersRoute._addFileChildren(
  ApiUsersRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  PathlessLayoutRoute: PathlessLayoutRouteWithChildren,
  AuthRoute,
  CustomScriptDotjsRoute,
  DeferredRoute,
  ListingsRoute: ListingsRouteWithChildren,
  MesListingsRoute,
  MesLivraisonsRoute,
  PostsRoute: PostsRouteWithChildren,
  Posts2Route,
  RedirectRoute,
  UsersRoute: UsersRouteWithChildren,
  AdminUsersRoute,
  ApiUsersRoute: ApiUsersRouteWithChildren,
  ApiAuthSplatRoute,
  PostsPostIdDeepRoute
};
const routeTree = Route$q._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  const router2 = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => /* @__PURE__ */ jsx(NotFound, {}),
    scrollRestoration: true,
    context: {
      serverContext: void 0
    }
  });
  return router2;
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  NotFound as N,
  Route$p as R,
  Route$n as a,
  Route$m as b,
  Route$l as c,
  Route$k as d,
  acceptListingRequest as e,
  fetchListingRequests as f,
  Route$i as g,
  authClient as h,
  Route$b as i,
  fetchDriverStatus as j,
  fetchDriverDeliveryRequests as k,
  listingStatusLabels as l,
  cancelListingDelivery as m,
  Route$a as n,
  Route$9 as o,
  createListing as p,
  Route$6 as q,
  requestListingDelivery as r,
  fetchAdminUsers as s,
  promoteUserToDriver as t,
  Route$4 as u,
  router as v
};
