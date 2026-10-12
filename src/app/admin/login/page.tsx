"use client";
import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { login } from "@/server/actions/admin";
import { Crest } from "@/components/layout/Logo";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const [error, action, pending] = useActionState(login, null);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      <label htmlFor="email" className="block text-[15px] font-semibold text-white">
        Faculty email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoFocus
        autoComplete="username"
        className="w-full rounded-xl bg-white px-4 py-3.5 text-base text-[#1d1d1b] outline-none ring-2 ring-transparent focus:ring-[#c7a54f]"
      />
      <label htmlFor="password" className="block text-[15px] font-semibold text-white">
        Password
      </label>
      <div className="relative">
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          required
          autoComplete="current-password"
          className="w-full rounded-xl bg-white px-4 py-3.5 pr-12 text-base text-[#1d1d1b] outline-none ring-2 ring-transparent focus:ring-[#c7a54f]"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-black/50 hover:bg-black/5"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-[#b3261e]/15 px-4 py-3 text-[15px] font-medium text-[#ffb4ab]"
        >
          {error}
        </p>
      )}
      <button
        disabled={pending}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c7a54f] text-base font-bold text-[#0b0e11] transition hover:bg-[#ead9a6] disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
        {pending ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}

export default function Login() {
  return (
    <main className="grid min-h-svh place-items-center bg-[#0b1711] px-4 py-12 font-sans">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-black ring-1 ring-[#c7a54f]/50">
            <Crest className="h-14 w-auto" priority />
          </span>
          <h1 className="mt-5 font-grotesk text-3xl font-bold text-white">E-Cell admin</h1>
          <p className="mt-2 text-[15px] text-white/60">Log in to update the website and read messages.</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-8 text-center text-sm text-white/45">
          Need access or forgot your password? Ask your E-Cell website coordinator.
        </p>
      </div>
    </main>
  );
}
