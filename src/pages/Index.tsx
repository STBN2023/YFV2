import GlowingTitle from "@/components/GlowingTitle";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-fuchsia-50 via-amber-50 to-emerald-50">
      <div className="p-4 mt-4 flex justify-center">
        <GlowingTitle />
      </div>

      <div className="flex-1 grid place-items-center px-4">
        <Button
          asChild
          size="lg"
          className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white shadow hover:brightness-105"
        >
          <Link to="/pseudo">Jouer maintenant</Link>
        </Button>
      </div>

      <div className="p-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;