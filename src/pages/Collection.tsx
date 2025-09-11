"use client";

import GlowingTitle from "@/components/GlowingTitle";
import { MadeWithDyad } from "@/components/made-with-dyad";
import AuthStatus from "@/components/AuthStatus";
import UserPoints from "@/components/UserPoints";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CollectionTabs from "@/components/CollectionTabs";

const Collection = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4 gap-6">
      <div className="w-full max-w-4xl flex flex-col items-center gap-2 mt-2">
        <GlowingTitle />
        <AuthStatus />
      </div>

      <UserPoints />

      <div className="w-full max-w-5xl">
        <CollectionTabs />
      </div>

      <div className="flex gap-3">
        <Button asChild className="rounded-full bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white hover:brightness-105">
          <Link to="/jeu">Aller à la roue</Link>
        </Button>
        <Button asChild className="rounded-full bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white hover:brightness-105">
          <Link to="/leaderboard">Voir le classement</Link>
        </Button>
        <Button asChild className="rounded-full bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white hover:brightness-105">
          <Link to="/">Accueil</Link>
        </Button>
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default Collection;