import GlowingTitle from "@/components/GlowingTitle";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4 gap-8">
      <div className="w-full max-w-4xl flex flex-col items-center gap-4 mt-4">
        <GlowingTitle />
      </div>

      <div>
        <Button
          asChild
          size="lg"
          className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white shadow hover:brightness-105"
        >
          <Link to="/pseudo">Jouer maintenant</Link>
        </Button>
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default Index;