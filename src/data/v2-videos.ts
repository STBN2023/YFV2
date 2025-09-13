export type V2Video = {
  id: string;
  title: string;
  src: string;
  poster?: string;
  points: number;
};

// Les sources pointent vers les chemins habituels.
// Comme les .mp4 sont ignorés/absents du repo, ajoutez vos URLs hébergées (ex: Supabase Storage) ici quand prêtes.
export const V2_VIDEOS: V2Video[] = [
  { id: "prix1", title: "YOURI BOUCLETTE", src: "/prizes/v2/Prix 1 - YOURI BOUCLETTE.mp4", poster: "/placeholder.svg", points: 12 },
  { id: "prix2", title: "YOURI ELECTRON", src: "/prizes/v2/Prix 2 - YOURI ELECTRON.mp4", poster: "/placeholder.svg", points: 25 },
  { id: "prix3", title: "YOURI GORILLE", src: "/prizes/v2/Prix 3 - YOURI GORILLE.mp4", poster: "/placeholder.svg", points: 35 },
  { id: "prix4", title: "YOURI HULK", src: "/prizes/v2/Prix 4 - YOURI HULK.mp4", poster: "/placeholder.svg", points: 120 },
  { id: "prix5", title: "YOURI LAZER EYES", src: "/prizes/v2/Prix 5 - YOURI LAZER EYES.mp4", poster: "/placeholder.svg", points: 60 },
  // Fichier avec espace avant .mp4 conservé tel quel
  { id: "prix6", title: "YOURI LORD FARQUAAD", src: "/prizes/v2/Prix 6 - YOURI LORD FARQUAAD .mp4", poster: "/placeholder.svg", points: 20 },
  { id: "prix7", title: "YOURI MIGNONS", src: "/prizes/v2/Prix 7 - YOURI MIGNONS.mp4", poster: "/placeholder.svg", points: 30 },
  { id: "prix8", title: "YOURI PHARAON", src: "/prizes/v2/Prix 8 - YOURI PHARAON.mp4", poster: "/placeholder.svg", points: 150 },
  { id: "prix9", title: "YOURI VOLANT", src: "/prizes/v2/Prix 9 - YOURI VOLANT.mp4", poster: "/placeholder.svg", points: 1200 },
];