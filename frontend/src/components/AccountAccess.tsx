import { LocalizedText } from "../i18n/LocalizedText";
import { useEffect, useState } from "react";
import {
  API,
  getUser,
  saveSession,
  signOut,
  type SessionUser,
} from "../api/client";

export default function AccountAccess() {
  const [user, setUser] = useState<SessionUser | null>(getUser);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const update = () => setUser(getUser());
    window.addEventListener("agrioptima-auth-change", update);
    return () => window.removeEventListener("agrioptima-auth-change", update);
  }, []);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    const response = await fetch(`${API}/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        mode === "login"
          ? { email: values.email, password: values.password }
          : {
              email: values.email,
              password: values.password,
              role: values.role,
              profile_id: values.profile_id || null,
            },
      ),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(result.detail || "Account request failed");
      return;
    }
    saveSession(result);
    setOpen(false);
  };
  return (
    <>
      <button
        onClick={() => (user ? setOpen(true) : setOpen(true))}
        className="account-access-trigger fixed right-4 bottom-4 z-[10000] rounded-full bg-[#26483E] px-5 py-3 text-sm font-semibold text-white shadow-xl"
      ><LocalizedText source={" {0} "} values={[user ? `${user.role.toLowerCase()} account` : `Secure sign in`]} /></button>
      {open && (
        <div
          className="fixed inset-0 z-[10001] grid place-items-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <section
            className="account-access-panel w-full max-w-md rounded-3xl bg-[#EAE7DD] p-7 text-[#26483E] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="float-right text-2xl"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            {user ? (
              <>
                <span className="text-xs font-bold uppercase text-green-800"><LocalizedText source={" Authenticated session "} /></span>
                <h2 className="mt-3 text-2xl font-bold"><LocalizedText source={"{0}"} values={[user.email]} /></h2>
                <p className="my-4"><LocalizedText source={" Role: {0} {1} "} values={[user.role, user.profile_id ? ` · ${user.profile_id}` : ""]} /></p>
                <button
                  className="rounded-full bg-[#26483E] px-5 py-3 text-white"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                ><LocalizedText source={" Sign out "} /></button>
              </>
            ) : (
              <>
                <span className="text-xs font-bold uppercase text-green-800"><LocalizedText source={" Production account "} /></span>
                <h2 className="mt-3 text-3xl font-bold"><LocalizedText source={" {0} "} values={[mode === "login" ? "Welcome back" : "Create account"]} /></h2>
                <p className="mb-5 text-sm text-slate-600"><LocalizedText source={" Demo browsing remains available. Sign in protects saved actions when production authentication is enabled. "} /></p>
                <form className="grid gap-3" onSubmit={submit}>
                  <input
                    className="rounded-xl border p-3"
                    name="email"
                    type="email"
                    required
                    placeholder="Email"
                  />
                  <input
                    className="rounded-xl border p-3"
                    name="password"
                    type="password"
                    minLength={10}
                    required
                    placeholder="Password (10+ characters)"
                  />
                  {mode === "register" && (
                    <>
                      <select className="rounded-xl border p-3" name="role">
                        <option value="FARMER"><LocalizedText source={"Farmer"} /></option>
                        <option value="BUYER"><LocalizedText source={"Buyer"} /></option>
                      </select>
                      <input
                        className="rounded-xl border p-3"
                        name="profile_id"
                        placeholder="Existing profile ID (optional)"
                      />
                    </>
                  )}
                  {error && <p className="text-sm text-red-700"><LocalizedText source={"{0}"} values={[error]} /></p>}
                  <button
                    disabled={busy}
                    className="rounded-xl bg-[#26483E] p-3 font-bold text-white"
                  ><LocalizedText source={" {0} "} values={[busy
                      ? "Please wait…"
                      : mode === "login"
                        ? "Sign in"
                        : "Create secure account"]} /></button>
                </form>
                <button
                  className="mt-4 text-sm font-semibold text-green-800"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setError("");
                  }}
                ><LocalizedText source={" {0} "} values={[mode === "login"
                    ? "Need an account? Register"
                    : "Already registered? Sign in"]} /></button>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
