import type { auth } from "../lib/auth.js";

export type HonoVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
