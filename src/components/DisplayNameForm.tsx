"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/auth/SessionProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { showSuccess } from "@/utils/toast";
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";

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

  const [name, setName] = useState("");
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Availability check
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const debouncedName = useDebounced(name.trim());

  const isValid = useMemo(() => NAME_REGEX.test(name.trim()), [name]);
  const chars = name.trim().length;

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("first_name")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        setName(data?.first_name ?? "");
        setInitialLoaded(true);
      });
  }, [userId]);

  useEffect(() => {
    // reset availability if invalid or empty
    if (!debouncedName || !isValid || !userId) {
      setAvailable(null);
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("first_name", debouncedName)
      .neq("id", userId)
      .then(({ count, error }) => {
        if (cancelled) return;
        if (error) throw error;
        setAvailable(!count || count === 0);
        setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedName, isValid, userId]);

  if (!userId || !initialLoaded) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = name.trim();
    if (!NAME_REGEX.test(value)) return;
    if (available === false) return;

    setSaving(true);
    const { error } = await supabase.from("profiles").update({ first_name: value }).eq("id", userId);
    if (error) throw error;
    setSaving(false);
    showSuccess("Pseudo enregistré !");
  };

  const fillSuggestion = () => {
    setName(makeSuggestion());
  };

  const statusIcon = (() => {
    if (!name.trim()) return null;
    if (!isValid) {
      return <XCircle className="h-5 w-5 text-red-500" aria-hidden />;
    }
    if (checking) {
      return <Loader2 className="h-5 w-5 animate-spin text-gray-500" aria-hidden />;
    }
    if (available === true) {
      return <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />;
    }
    if (available === false) {
      return <XCircle className="h-5 w-5 text-red-500" aria-hidden />;
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

  return (
    <form onSubmit={onSubmit} className="w-full max-w-3xl mx-auto">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Choisis ton pseudo gamer
          </CardTitle>
          <CardDescription>
            Il sera affiché dans le classement et sur ta collection. Tu peux le modifier à tout moment.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="gamer-name" className="text-sm">Pseudo</Label>
              <span className={`text-xs ${chars > 20 ? "text-red-600" : "text-gray-500"}`}>{chars}/20</span>
            </div>

            <div className="relative">
              <Input
                id="gamer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: LuckyMax, MysticSpin42..."
                className="pr-10"
                autoComplete="off"
                spellCheck={false}
                maxLength={24}
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                {statusIcon}
              </div>
            </div>

            <p className={`text-xs ${(!isValid || available === false) ? "text-red-600" : "text-gray-500"}`}>
              {helperText}
            </p>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={fillSuggestion}>
                Suggérer un pseudo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setName(makeSuggestion())}
              >
                {makeSuggestion()}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setName(makeSuggestion())}
              >
                {makeSuggestion()}
              </Button>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving || !isValid || checking || available === false}
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
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default DisplayNameForm;