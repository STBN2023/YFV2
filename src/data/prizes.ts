export type Prize = {
  id: string;
  label: string;
  image: string;
  points: number;
};

export const PRIZES: Prize[] = [
  { id: "prix1", label: "YOURI BIG EYES", image: "/prizes/prix1.png", points: 5 },
  { id: "prix2", label: "OLD YOURI BIKER STYLE", image: "/prizes/prix2.png", points: 10 },
  { id: "prix3", label: YOURI CLASSICS", image: "/prizes/prix3.png", points: 15 },
  { id: "prix4", label: "YOURI SUPER SAIYAN", image: "/prizes/prix4.png", points: 20 },
  { id: "prix5", label: "YOURI PINKY", image: "/prizes/prix5.png", points: 25 },
  { id: "prix6", label: "YOURI SLUMDOG", image: "/prizes/prix6.png", points: 0 },
  { id: "prix7", label: "YOURI MIGNON", image: "/prizes/prix7.png", points: 30 },
  { id: "prix8", label: "OURI YELLOWSTONE", image: "/prizes/prix8.png", points: 12 },
  { id: "prix9", label: "YOURI SWAG", image: "/prizes/prix9.png", points: 40 },
  { id: "prix10", label: "THIS IS NOT YOURI", image: "/prizes/prix10.png", points: 8 },
  { id: "prix11", label: "OURI SANTA DREAM", image: "/prizes/prix11.png", points: 50 },
  { id: "prix12", label: "Prix 12", image: "/prizes/prix12.png", points: 18 },
  { id: "prix13", label: "Prix 13", image: "/prizes/prix13.png", points: 35 },
];