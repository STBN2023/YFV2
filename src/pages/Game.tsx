import GlowingTitle from "@/components/GlowingTitle";
import { MadeWithDyad } from "@/components/made-with-dyad";
import WheelOfFortune from "@/components/WheelOfFortune";
import AuthStatus from "@/components/AuthStatus";
import UserPoints from "@/components/UserPoints";
import AudioToggle from "@/components/AudioToggle";
import CollectionProgress from "@/components/CollectionProgress";
import SpinHistory from "@/components/SpinHistory";
import FloatingNav from "@/components/FloatingNav";
import V2Progress from "@/components/V2Progress";

const Game = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-fuchsia-50 via-amber-50 to-emerald-50 p-4 gap-6">
      <div className="w-full max-w-3xl flex flex-col items-center gap-2 mt-2 relative">
        <GlowingTitle />
        <div className="absolute right-0 top-0">
          <AudioToggle />
        </div>
        <AuthStatus />
      </div>

      <UserPoints />

      <WheelOfFortune />

      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <CollectionProgress />
        <SpinHistory />
        <V2Progress />
      </div>

      <MadeWithDyad />

      <FloatingNav />
    </div>
  );
};

export default Game;