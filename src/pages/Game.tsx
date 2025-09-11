import GlowingTitle from "@/components/GlowingTitle";
import { MadeWithDyad } from "@/components/made-with-dyad";
import WheelOfFortune from "@/components/WheelOfFortune";
import AuthStatus from "@/components/AuthStatus";
import UserPoints from "@/components/UserPoints";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Game = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4 gap-6">
      <div className="w-full max-w-3xl flex flex-col items-center gap-2 mt-2">
        <GlowingTitle />
        <AuthStatus />
      </div>

      <UserPoints />

      <WheelOfFortune />

      <div className="flex gap-3">
        <Button asChild className="rounded-full bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white hover:brightness-105">
          <Link to="/collection">Votre collection</Link>
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

export default Game;