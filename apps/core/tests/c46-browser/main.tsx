// C46 browser fixture only. It is not loaded by src/main.tsx or Production.
import { createRoot } from "react-dom/client";
import { App } from "../../src/App";
import { createCommandCenterRuntimeEnvironment } from "../../src/integration/commandCenter/commandCenterRuntimeEnvironment";
import { createSupabaseBrowserAuthAdapter } from "../../src/integration/auth/supabaseBrowserAuthAdapter";
import "../../src/styles.css";

const EMAIL = "pilot@example.test";
const PASSWORD = "synthetic-pass-only";
const TOKEN = "c46-synthetic-access-token-not-a-real-jwt-abcdefgh";
type Listener = (event: string, session: any) => void;
let callback: Listener | undefined;
let current: any = null;
const statistics = {
  signIns: 0, signOuts: 0, restoreCalls: 0, unauthorized: 0,
  networkCalls: 0, sourceReads: 0, lastMode: "closed",
};
const client = {
  auth: {
    async getSession() {
      statistics.restoreCalls++;
      return { data: { session: current }, error: null };
    },
    async signInWithPassword(credentials: { email: string; password: string }) {
      statistics.signIns++;
      if (credentials.email !== EMAIL || credentials.password !== PASSWORD) {
        statistics.unauthorized++;
        return { data: { session: null }, error: { code: "C46_FIXTURE_DENIED" } };
      }
      current = {
        access_token: TOKEN, user: { id: "c46-fixture", email: EMAIL },
      };
      callback?.("SIGNED_IN", current);
      return { data: { session: current }, error: null };
    },
    async signOut({ scope }: { scope: "local" }) {
      if (scope !== "local") throw Error("C46_LOCAL_ONLY");
      statistics.signOuts++;
      current = null;
      callback?.("SIGNED_OUT", null);
      return { error: null };
    },
    onAuthStateChange(cb: Listener) {
      callback = cb;
      return {
        data: {
          subscription: {
            unsubscribe() { if (callback === cb) callback = undefined; },
          },
        },
      };
    },
  },
};
const factory = () => createSupabaseBrowserAuthAdapter({ client });
const params = new URLSearchParams(location.search);
const useMock = params.get("runtime") === "mock";
statistics.lastMode = useMock ? "mock-rejected" : "closed";

// This is a test instrumentation object, never part of production.
Object.defineProperty(window, "__C46_TEST__", {
  value: Object.freeze({ statistics, fixture: true }), configurable: false,
});
createRoot(document.getElementById("root")!).render(
  <App
    pathname="/"
    authProviderFactory={factory}
    runtimeEnvironmentFactory={useMock
      ? () => createCommandCenterRuntimeEnvironment()
      : undefined}
  />,
);
