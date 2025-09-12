export type V2Video = {
  id: string;
  title: string;
  src: string;
  poster?: string;
};

// Les sources pointent vers les chemins habituels.
// Comme les .mp4 sont ignorés/absents du repo, ajoutez vos URLs hébergées (ex: Supabase Storage) ici quand prêtes.
export const V2_VIDEOS: V2Video[] = [
  { id: "prix1", title: "Prix 1 - YOURI BOUCLETTE", src: "/prizes/v2/Prix 1 - YOURI BOUCLETTE.mp4", poster: "/placeholder.svg" },
  { id: "prix2", title: "Prix 2 - YOURI ELECTRON", src: "/prizes/v2/Prix 2 - YOURI ELECTRON.mp4", poster: "/placeholder.svg" },
  { id: "prix3", title: "Prix 3 - YOURI GORILLE", src: "/prizes/v2/Prix 3 - YOURI GORILLE.mp4", poster: "/placeholder.svg" },
  { id: "prix4", title: "Prix 4 - YOURI HULK", src: "/prizes/v2/Prix 4 - YOURI HULK.mp4", poster: "/placeholder.svg" },
  { id: "prix5", title: "Prix 5 - YOURI LAZER EYES", src: "/prizes/v2/Prix 5 - YOURI LAZER EYES.mp4", poster: "/placeholder.svg" },
  // Fichier avec espace avant .mp4 conservé tel quel
  { id: "prix6", title: "Prix 6 - YOURI LORD FARQUAAD", src: "/prizes/v2/Prix 6 - YOURI LORD FARQUAAD .mp4", poster: "/placeholder.svg" },
  { id: "prix7", title: "Prix 7 - YOURI MIGNONS", src: "/prizes/v2/Prix 7 - YOURI MIGNONS.mp4", poster: "/placeholder.svg" },
  { id: "prix8", title: "Prix 8 - YOURI PHARAON", src: "/prizes/v2/Prix 8 - YOURI PHARAON.mp4", poster: "/placeholder.svg" },
  { id: "prix9", title: "Prix 9 - YOURI VOLANT", src: "/prizes/v2/Prix 9 - YOURI VOLANT.mp4", poster: "/placeholder.svg" },
];