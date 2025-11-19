import { createAuthClient } from "better-auth/react";
const baseURL = "http://localhost:3000";
const authClient = createAuthClient({
  baseURL
});
export {
  authClient as a
};
