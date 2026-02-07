export type GridCell = {
  id: string;
  x: number;
  y: number;
  tileId: string | null;
};

export function createGridCells(width: number, height: number): GridCell[] {
  const cells: GridCell[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      cells.push({
        id: `cell-${x}-${y}`,
        x,
        y,
        tileId: null,
      });
    }
  }
  return cells;
}
