"use client";
import React, { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { translations, Language } from "../text";
import { Lock, Mail, Loader2, AlertCircle ,Eye, EyeOff } from "lucide-react";

interface SignInProps {
  lang: Language;
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
}

export default function SignInCard({ lang, onSuccess, onSwitchToSignUp }: SignInProps) {
  const t = translations[lang];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // NEW: State tracking credential character layout masking rules
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsPending(true);
    setErrorMessage(null);

    await signIn.email({
      email,
      password,
      callbackURL: "/",
      fetchOptions: {
        onRequest: () => setIsPending(true),
        onSuccess: () => {
          setIsPending(false);
          onSuccess();
        },
        onError: (ctx) => {
          setIsPending(false);
          setErrorMessage(ctx.error.code === "INVALID_EMAIL_OR_PASSWORD" ? t.invalidCredentials : ctx.error.message);
        },
      },
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card text-card-foreground border rounded-xl shadow-sm transition-all duration-200">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight">{t.signInTitle}</h2>
        <p className="text-xs text-muted-foreground">{t.signInSubtitle}</p>
      </div>

      {errorMessage && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-muted-foreground">{t.emailLabel}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@internal.local"
              className="w-full text-sm bg-background border rounded-md py-2 pl-10 pr-3 focus:ring-1 focus:ring-primary outline-none text-foreground"
              required
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-muted-foreground">{t.passwordLabel}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"} // Dynamic switch toggle layout character type matrix
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm bg-background border rounded-md py-2 pl-10 pr-10 focus:ring-1 focus:ring-primary outline-none text-foreground"
              required
              disabled={isPending}
            />
            {/* Interactive Eye Button element positioned cleanly over input frames */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none transition-colors"
              title={showPassword ? "Hide password string" : "Show plain text password string"}
              disabled={isPending}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground text-sm font-bold py-2.5 px-4 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>{t.btnAuthenticate}</span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">{t.newOperator} </span>
        <button
          onClick={onSwitchToSignUp}
          className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer"
          disabled={isPending}
        >
          {t.provisionProfile}
        </button>
      </div>
    </div>
  );
}

