"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CollectionGrid from "@/components/CollectionGrid";
import { useSession } from "@/components/auth/SessionProvider";

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
  const { session } = useSession();

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url, points")
      .order("points", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) throw error;
        setRows(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-amber-50 to-emerald-50">
      <div className="px-4 py-8 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Classement</h1>
          <Link to="/" className="text-blue-600 hover:underline">← Retour</Link>
        </div>

        {session && (
          <section id="collection" className="scroll-mt-24">
            <CollectionGrid />
          </section>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-3">Top joueurs</h2>
          {loading ? (
            <div className="text-gray-500">Chargement...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Joueur</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => {
                    const name = [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || r.id.slice(0, 8);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell className="flex items-center gap-3">
                          {r.avatar_url ? (
                            <img src={r.avatar_url} alt={name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200" />
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
    </div>
  );
};

export default Leaderboard;