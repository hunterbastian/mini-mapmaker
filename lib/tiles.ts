import { TerrainId } from "@/lib/project";

export type Tile = {
  id: TerrainId;
  name: string;
  category: "terrain";
  className: string;
  svg: string;
};

export const tiles: Tile[] = [
  {
    id: "grass",
    name: "Grassland",
    category: "terrain",
    className: "grass",
    svg: `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 44C18 36 26 36 36 44C43 50 50 50 56 46" stroke="#2E4630" stroke-width="3" stroke-linecap="round"/>
        <path d="M10 30L16 42M20 28L24 42M30 26L32 42" stroke="#2E4630" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: "water",
    name: "Water",
    category: "terrain",
    className: "water",
    svg: `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 26C12 22 18 22 24 26C30 30 36 30 42 26C48 22 54 22 58 26" stroke="#2E3C4B" stroke-width="3" stroke-linecap="round"/>
        <path d="M6 38C12 34 18 34 24 38C30 42 36 42 42 38C48 34 54 34 58 38" stroke="#2E3C4B" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: "mountain",
    name: "Mountain",
    category: "terrain",
    className: "mountain",
    svg: `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 50L26 20L42 44L54 30L58 50H6Z" fill="#5B5248" opacity="0.25"/>
        <path d="M6 50L26 20L42 44L54 30L58 50H6Z" stroke="#3A342E" stroke-width="3" stroke-linejoin="round"/>
        <path d="M22 28L30 38L34 32L40 40" stroke="#3A342E" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,
  },
  {
    id: "forest",
    name: "Forest",
    category: "terrain",
    className: "forest",
    svg: `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 46L22 26L32 46H12Z" stroke="#1F2F22" stroke-width="3" stroke-linejoin="round"/>
        <path d="M24 50L34 28L44 50H24Z" stroke="#1F2F22" stroke-width="3" stroke-linejoin="round"/>
        <path d="M16 50V56M40 50V56" stroke="#1F2F22" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `,
  },
];

export const tileById = new Map(tiles.map((tile) => [tile.id, tile]));
