import { c as createMiddleware } from "./createMiddleware-CRzJRBrm.js";
function dedupeSerializationAdapters(deduped, serializationAdapters) {
  for (let i = 0, len = serializationAdapters.length; i < len; i++) {
    const current = serializationAdapters[i];
    if (!deduped.has(current)) {
      deduped.add(current);
      if (current.extends) {
        dedupeSerializationAdapters(deduped, current.extends);
      }
    }
  }
}
const createStart = (getOptions) => {
  return {
    getOptions: async () => {
      const options = await getOptions();
      if (options.serializationAdapters) {
        const deduped = /* @__PURE__ */ new Set();
        dedupeSerializationAdapters(
          deduped,
          options.serializationAdapters
        );
        options.serializationAdapters = Array.from(deduped);
      }
      return options;
    },
    createMiddleware
  };
};
const attachRequestMiddleware = createMiddleware({
  type: "request"
}).server(async ({
  next,
  request,
  context
}) => {
  return next({
    context: {
      ...context ?? {},
      serverContext: {
        request
      }
    }
  });
});
const startInstance = createStart(() => ({
  requestMiddleware: [attachRequestMiddleware]
}));
export {
  startInstance as default,
  startInstance
};
