"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/auth/SessionProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showSuccess } from "@/utils/toast";

const DisplayNameForm = () => {
  const { session } = useSession();
  const userId = session?.user?.id;
  const [name, setName] = useState("");
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

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

  if (!userId || !initialLoaded) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("profiles").update({ first_name: name.trim() }).eq("id", userId);
    setSaving(false);
    showSuccess("Pseudo enregistré !");
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-3xl mx-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-4 flex gap-3 items-center">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Pseudo (optionnel)"
          className="flex-1"
        />
        <Button type="submit" disabled={saving || !name.trim()}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
};

export default DisplayNameForm;