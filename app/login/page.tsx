"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function signIn() {
    setMsg("Sending magic link...");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setMsg(error ? error.message : "Check your email for the login link.");
  }

  return (
    <main className="p-10 space-y-4">
      <h1 className="text-3xl font-semibold">Login</h1>
      <p className="text-sm opacity-70">
        Enter your email to receive a magic link.
      </p>
      <input
        className="w-full max-w-md rounded-md border p-2"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="rounded-md border px-4 py-2" onClick={signIn}>
        Send magic link
      </button>
      {msg ? <p className="text-sm opacity-80">{msg}</p> : null}
    </main>
  );
}