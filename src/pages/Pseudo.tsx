import GlowingTitle from "@/components/GlowingTitle";
import { MadeWithDyad } from "@/components/made-with-dyad";
import DisplayNameForm from "@/components/DisplayNameForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Pseudo = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-fuchsia-50 via-amber-50 to-emerald-50 p-4 gap-6">
      <div className="w-full max-w-3xl flex flex-col items-center gap-2 mt-2">
        <GlowingTitle />
        <p className="text-sm text-gray-600 text-center">
          Choisissez votre pseudo pour sauvegarder vos points, vos tirages et votre collection.
        </p>
      </div>

      <div className="w-full max-w-3xl">
        <DisplayNameForm />
      </div>

      <div className="flex items-center gap-3">
        <Button asChild className="rounded-full bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white hover:brightness-105">
          <Link to="/jeu">Aller à la roue</Link>
        </Button>
        <Button asChild className="rounded-full bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white hover:brightness-105">
          <Link to="/">Retour à l’accueil</Link>
        </Button>
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default Pseudo;