"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FloatingNav from "@/components/FloatingNav";

type Row = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  points: number | null;
};

const Leaderboard = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url, points")
      .gt("points", 0) // filtre serveur
      .order("points", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) throw error;

        // Filtre client: supprime toute ligne avec points <= 0 ou non valide
        const filtered = (data as Row[] | null)?.filter((r) => {
          const p = Number(r.points ?? 0);
          return Number.isFinite(p) && p > 0;
        }) ?? [];

        setRows(filtered);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-amber-50 to-emerald-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900">
      <div className="px-4 py-8 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Classement</h1>
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">← Retour</Link>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Top joueurs</h2>
          {loading ? (
            <div className="text-gray-600 dark:text-gray-300">Chargement...</div>
          ) : rows.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-300">Pas encore de scores à afficher.</div>
          ) : (
            <div className="bg-white/90 dark:bg-neutral-900/80 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50/80 dark:bg-neutral-800/60">
                  <TableRow>
                    <TableHead className="w-16 text-gray-700 dark:text-gray-200">#</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-200">Joueur</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-200">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => {
                    const name = [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || r.id.slice(0, 8);
                    return (
                      <TableRow key={r.id} className="hover:bg-gray-50/60 dark:hover:bg-neutral-800/50">
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell className="flex items-center gap-3">
                          {r.avatar_url ? (
                            <img src={r.avatar_url} alt={name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-neutral-700" />
                          )}
                          <span>{name}</span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{r.points ?? 0}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <FloatingNav />
    </div>
  );
};

export default Leaderboard;