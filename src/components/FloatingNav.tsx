"use client";

import { Link } from "react-router-dom";
import { Home, PlayCircle, Grid2X2, Trophy } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const FloatingNav = () => {
  return (
    <div className="fixed bottom-4 inset-x-0 z-50 pointer-events-none">
      <div className="mx-auto w-full max-w-sm px-4">
        <nav className="pointer-events-auto bg-white/90 dark:bg-neutral-900/80 backdrop-blur border border-white/50 dark:border-white/10 shadow-lg rounded-full px-3 py-2">
          <ul className="flex items-center justify-around text-gray-700 dark:text-gray-200">
            <li>
              <Link
                to="/"
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                aria-label="Home"
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px] leading-none">Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/jeu"
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                aria-label="Game"
              >
                <PlayCircle className="w-5 h-5" />
                <span className="text-[10px] leading-none">Game</span>
              </Link>
            </li>
            <li>
              <Link
                to="/collection"
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                aria-label="Collection"
              >
                <Grid2X2 className="w-5 h-5" />
                <span className="text-[10px] leading-none">Collection</span>
              </Link>
            </li>
            <li>
              <Link
                to="/leaderboard"
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                aria-label="Leaderboard"
              >
                <Trophy className="w-5 h-5" />
                <span className="text-[10px] leading-none">Top</span>
              </Link>
            </li>
            <li className="ml-1">
              <div className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-full">
                <ThemeToggle />
                <span className="text-[10px] leading-none">Thème</span>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default FloatingNav;