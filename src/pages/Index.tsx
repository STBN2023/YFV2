import GlowingTitle from "@/components/GlowingTitle";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FloatingNav from "@/components/FloatingNav";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-fuchsia-50 via-amber-50 to-emerald-50">
      <div className="p-4 mt-4 flex justify-center">
        <GlowingTitle />
      </div>

      <div className="flex-1 grid place-items-center px-4">
        <div className="flex flex-col items-center gap-3">
          <Button
            asChild
            size="lg"
            className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white shadow hover:brightness-105"
          >
            <Link to="/pseudo">Jouer maintenant</Link>
          </Button>

          <Link
            to="/admin"
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            Admin: uploader les vidéos V2
          </Link>
        </div>
      </div>

      <div className="p-4">
        <MadeWithDyad />
      </div>

      <FloatingNav />
    </div>
  );
};

export default Index;