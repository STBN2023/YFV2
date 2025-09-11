"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/auth/SessionProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccess, showError } from "@/utils/toast";
import { CheckCircle2, XCircle, Loader2, Sparkles, RefreshCcw, X, AtSign } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const NAME_REGEX = /^[a-zA-Z0-9_.-]{3,20}$/;

function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function makeSuggestion(): string {
  const adjectives = ["Lucky", "Mystic", "Golden", "Turbo", "Cosmic", "Swift", "Blazing", "Shadow", "Neon", "Royal"];
  const nouns = ["Spin", "Fortune", "Wheel", "Nova", "Blitz", "Rider", "Rogue", "Ace", "Spirit", "Vortex"];
  const a = adjectives[Math.floor(Math.random() * adjectives.length)];
  const n = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.random() < 0.5 ? "" : String(Math.floor(10 + Math.random() * 89));
  return `${a}${n}${num}`.slice(0, 20);
}

const DisplayNameForm = () => {
  const { session } = useSession();
  const userId = session?.user?.id;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const debouncedName = useDebounced(name.trim());

  const isValid = useMemo(() => NAME_REGEX.test(name.trim()), [name]);
  const chars = name.trim().length;

  const [seed, setSeed] = useState(0);
  const suggestions = useMemo(() => [makeSuggestion(), makeSuggestion(), makeSuggestion()], [seed]);

  useEffect(() => {
    if (!userId) {
      setInitialLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("first_name")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setName(data?.first_name ?? "");
        setInitialLoaded(true);
      });
  }, [userId]);

  useEffect(() => {
    if (!debouncedName || !isValid) {
      setAvailable(null);
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);

    const run = async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        if (!cancelled) {
          setAvailable(true);
          setChecking(false);
        }
        return;
      }

      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .ilike("first_name", debouncedName);

      if (cancelled) return;

      if (error) {
        setAvailable(true);
        setChecking(false);
        return;
      }

      setAvailable(!count || count === 0);
      setChecking(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedName, isValid]);

  const tryAnonymous = async () => {
    const fn: any = (supabase as any).auth?.signInAnonymously;
    if (typeof fn !== "function") {
      showError("Authentification anonyme indisponible dans le client. Activez ‘Anonymous’ dans Supabase, ou utilisez la page /login.");
      return { ok: false as const };
    }
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        showError(`Impossible de créer une session: ${error.message}. Vous pouvez aussi vous connecter sur /login.`);
        return { ok: false as const };
      }
      return { ok: true as const, userId: data?.user?.id };
    } catch (e: any) {
      showError(`Erreur de session: ${e?.message ?? "inconnue"}. Essayez /login.`);
      return { ok: false as const };
    }
  };

  const triggerAnon = async () => {
    await tryAnonymous();
  };

  const isReady = initialLoaded;

  if (!isReady) {
    return (
      <div className="relative w-full max-w-3xl mx-auto rounded-2xl p-[1px] bg-gradient-to-r from-fuchsia-500/50 via-amber-400/50 to-emerald-400/50 shadow-lg">
        <Card className="rounded-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border border-white/40 dark:border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="bg-gradient-to-r from-fuchsia-500 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
                Chargement du formulaire…
              </span>
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              Initialisation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = name.trim();
    if (!NAME_REGEX.test(value)) return;
    if (available === false) return;

    setSaving(true);

    let uid = userId;

    if (!uid) {
      const res = await tryAnonymous();
      if (!res.ok) {
        setSaving(false);
        return;
      }
      uid = res.userId ?? (await supabase.auth.getSession()).data.session?.user?.id ?? undefined;
    }

    if (!uid) {
      setSaving(false);
      showError("Session introuvable. Essayez /login.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: uid, first_name: value }, { onConflict: "id" });

    if (error) {
      setSaving(false);
      showError(`Enregistrement impossible: ${error.message}`);
      return;
    }

    setSaving(false);
    setSaved(true);
    showSuccess("Pseudo enregistré, bonne partie !");
    setTimeout(() => navigate("/jeu"), 350);
    setTimeout(() => setSaved(false), 1500);
  };

  const statusIcon = (() => {
    if (saving || checking) {
      return <Loader2 className="h-5 w-5 animate-spin text-gray-500" aria-hidden />;
    }
    if (!name.trim()) return null;
    if (!isValid) {
      return <XCircle className="h-5 w-5 text-red-500 drop-shadow-sm" aria-hidden />;
    }
    if (available === true || saved) {
      return <CheckCircle2 className="h-5 w-5 text-emerald-600 drop-shadow-sm" aria-hidden />;
    }
    if (available === false) {
      return <XCircle className="h-5 w-5 text-red-500 drop-shadow-sm" aria-hidden />;
    }
    return null;
  })();

  const helperText = (() => {
    if (!name.trim()) {
      return "3–20 caractères. Lettres, chiffres, _ . -";
    }
    if (!isValid) {
      return "Le pseudo doit faire 3–20 caractères et ne contenir que lettres, chiffres, _ . -";
    }
    if (checking) {
      return "Vérification de la disponibilité…";
    }
    if (available === false) {
      return "Ce pseudo est déjà pris. Essayez une variante.";
    }
    if (available === true) {
      return "Ce pseudo est disponible ✔";
    }
    return "3–20 caractères. Lettres, chiffres, _ . -";
  })();

  const validityClasses =
    !name.trim()
      ? ""
      : !isValid
        ? "border-red-400 focus-visible:ring-red-500"
        : available === false
          ? "border-red-400 focus-visible:ring-red-500"
          : available === true || saved
            ? "border-emerald-500 focus-visible:ring-emerald-600"
            : "";

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="relative w-full max-w-3xl mx-auto rounded-2xl p-[1px] bg-gradient-to-r from-fuchsia-500/60 via-amber-400/60 to-emerald-400/60 shadow-xl">
        <Card className="rounded-2xl bg-white/85 dark:bg-neutral-900/85 backdrop-blur supports-[backdrop-filter]:bg-white/60 border border-white/40 dark:border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 leading-tight">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="bg-gradient-to-r from-fuchsia-500 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
                Choisis ton pseudo gamer
              </span>
            </CardTitle>
            <CardDescription className="text-sm">
              Visible dans le classement et sur ta collection. Tu peux le modifier à tout moment.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            {!userId && (
              <div className="rounded-lg border bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200 p-3 text-sm flex items-center justify-between">
                <span>Aucune session active. On tentera la session anonyme à l’enregistrement. Sinon, utilisez la page “Login”.</span>
                <Button type="button" size="sm" className="rounded-full" onClick={triggerAnon}>
                  Essayer maintenant
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="gamer-name" className="text-sm font-medium">Pseudo</Label>
              <span className={`text-xs ${chars > 20 ? "text-red-600" : "text-gray-500"}`}>{chars}/20</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 group">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                <Input
                  id="gamer-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: LuckyMax, MysticSpin42..."
                  className={`pl-9 pr-10 h-11 rounded-lg transition-all ${validityClasses}`}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={24}
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  {statusIcon}
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving || !isValid || available === false}
                className="h-11 rounded-lg px-4 bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white shadow hover:brightness-105 disabled:opacity-60"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement…
                  </span>
                ) : (
                  "Enregistrer"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Effacer"
                onClick={() => setName("")}
                disabled={saving}
                className="h-11 w-11 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className={`text-xs ${(!isValid || available === false) ? "text-red-600" : "text-gray-500"}`}>
              {helperText}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setName(makeSuggestion())}
                className="rounded-full"
              >
                Suggérer un pseudo
              </Button>
              {suggestions.map((s, i) => (
                <Button
                  key={i}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setName(s)}
                  className="rounded-full"
                >
                  {s}
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSeed((n) => n + 1)}
                className="inline-flex items-center gap-1 rounded-full"
                aria-label="Régénérer des suggestions"
              >
                <RefreshCcw className="h-4 w-4" />
                Régénérer
              </Button>
              <Link to="/login" className="text-xs underline text-blue-600 ml-auto">Ou se connecter</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
};

export default DisplayNameForm;