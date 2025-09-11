import GlowingTitle from "@/components/GlowingTitle";
import { MadeWithDyad } from "@/components/made-with-dyad";
import WheelOfFortune from "@/components/WheelOfFortune";
import AuthStatus from "@/components/AuthStatus";
import UserPoints from "@/components/UserPoints";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DisplayNameForm from "@/components/DisplayNameForm";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4 gap-6">
      <div className="w-full max-w-3xl flex flex-col items-center gap-2 mt-2">
        <GlowingTitle />
        <AuthStatus />
      </div>

      <DisplayNameForm />

      <UserPoints />

      <WheelOfFortune />

      <div className="flex gap-3">
        <Button asChild variant="secondary">
          <Link to="/leaderboard">Voir le classement</Link>
        </Button>
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default Index;