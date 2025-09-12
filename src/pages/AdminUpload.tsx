"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/auth/SessionProvider";
import { showError, showSuccess } from "@/utils/toast";
import VideoTile from "@/components/VideoTile";

type StoredFile = {
  name: string;
  updated_at?: string;
  id?: string;
  metadata?: Record<string, any>;
};

const BUCKET = "videos";
const FOLDER = "v2";

function publicUrl(path: string) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

const AdminUpload: React.FC = () => {
  const { session } = useSession();
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<StoredFile[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const canUpload = !!session;

  const list = async () => {
    setLoadingList(true);
    const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, {
      limit: 200,
      offset: 0,
      sortBy: { column: "updated_at", order: "desc" },
    });
    if (error) {
      showError(`Liste impossible: ${error.message}`);
      setItems([]);
    } else {
      setItems(data ?? []);
    }
    setLoadingList(false);
  };

  useEffect(() => {
    list();
  }, []);

  const onSelect: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setFiles(e.target.files);
  };

  const uploadAll = async () => {
    if (!files || files.length === 0) return;
    setUploading(true);

    let okCount = 0;
    let failCount = 0;

    for (const file of Array.from(files)) {
      // On garde le nom tel quel pour correspondre aux clés attendues (y compris espaces)
      const path = `${FOLDER}/${file.name}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "video/mp4",
      });
      if (error) {
        failCount += 1;
        showError(`Échec: ${file.name} — ${error.message}`);
      } else {
        okCount += 1;
      }
    }

    if (okCount > 0) {
      showSuccess(`${okCount} fichier(s) téléversé(s)`);
    }
    if (failCount > 0) {
      showError(`${failCount} fichier(s) en erreur`);
    }

    setUploading(false);
    setFiles(null);
    await list();
  };

  const previews = useMemo(
    () =>
      items.map((it) => {
        const key = `${FOLDER}/${it.name}`;
        const url = publicUrl(key);
        return { name: it.name, url };
      }),
    [items]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-amber-50 to-emerald-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Uploader les vidéos V2</CardTitle>
            <CardDescription>
              Dépose ici tes .mp4/.webm pour le bucket “{BUCKET}”, dossier “{FOLDER}/”.
              Les vidéos s’afficheront dans l’onglet V2 de la Collection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Input
                type="file"
                multiple
                accept="video/mp4,video/webm,video/quicktime"
                onChange={onSelect}
                disabled={!canUpload || uploading}
                className="sm:max-w-md"
              />
              <Button onClick={uploadAll} disabled={!files || uploading || !canUpload} className="rounded-full">
                {uploading ? "Téléversement..." : "Téléverser"}
              </Button>
              <Button variant="outline" onClick={list} disabled={loadingList} className="rounded-full">
                {loadingList ? "Actualisation..." : "Actualiser la liste"}
              </Button>
              <Button variant="ghost" asChild className="rounded-full">
                <a href="/collection">Voir la collection</a>
              </Button>
            </div>
            {!canUpload && (
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                Vous n’êtes pas connecté. La connexion anonyme est automatique, mais si l’upload échoue,
                connectez-vous via la page /login et vérifiez les politiques Storage du bucket “{BUCKET}”.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vidéos présentes (videos/{FOLDER}/)</CardTitle>
            <CardDescription>Prévisualisation via URL publique du bucket.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingList ? (
              <div className="text-sm text-gray-600">Chargement…</div>
            ) : previews.length === 0 ? (
              <div className="text-sm text-gray-600">Aucun fichier trouvé. Téléverse des vidéos ci-dessus.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {previews.map((p) => (
                  <Card key={p.name} className="overflow-hidden">
                    <CardContent className="p-2">
                      <div className="relative aspect-square rounded-md overflow-hidden">
                        <VideoTile src={p.url} title={p.name} />
                      </div>
                      <div className="mt-2 text-xs break-all">{p.name}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUpload;