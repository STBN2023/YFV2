import { MadeWithDyad } from "@/components/made-with-dyad";
import WheelOfFortune from "@/components/WheelOfFortune";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8">Roue de la Fortune</h1>
      <WheelOfFortune />
      <MadeWithDyad />
    </div>
  );
};

export default Index;