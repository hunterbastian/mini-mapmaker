export const PROJECT_VERSION = 1;
const HISTORY_LIMIT = 100;

export type TerrainId = "grass" | "water" | "mountain" | "forest";
export type CellValue = TerrainId | null;
export type EditorTool = "paint" | "brush" | "erase";

export type MapProjectV1 = {
  version: 1;
  name: string;
  width: number;
  height: number;
  cells: CellValue[];
};

export type HistoryState = {
  past: CellValue[][];
  present: CellValue[];
  future: CellValue[][];
};

type ParseSuccess = {
  ok: true;
  project: MapProjectV1;
};

type ParseFailure = {
  ok: false;
  error: string;
};

export type ParseResult = ParseSuccess | ParseFailure;

const validTerrains = new Set<TerrainId>(["grass", "water", "mountain", "forest"]);

export function createEmptyProject(width: number, height: number, name = "Untitled Map"): MapProjectV1 {
  const size = width * height;
  return {
    version: PROJECT_VERSION,
    name,
    width,
    height,
    cells: Array.from({ length: size }, () => null),
  };
}

export function createHistory(cells: CellValue[]): HistoryState {
  return {
    past: [],
    present: cells,
    future: [],
  };
}

export function setCell(cells: CellValue[], index: number, value: CellValue): CellValue[] {
  if (index < 0 || index >= cells.length || cells[index] === value) {
    return cells;
  }

  const next = cells.slice();
  next[index] = value;
  return next;
}

export function paintLine(
  cells: CellValue[],
  fromIndex: number,
  toIndex: number,
  value: CellValue,
  width: number
): CellValue[] {
  const height = Math.ceil(cells.length / width);
  const startX = fromIndex % width;
  const startY = Math.floor(fromIndex / width);
  const endX = toIndex % width;
  const endY = Math.floor(toIndex / width);

  let x = startX;
  let y = startY;
  const dx = Math.abs(endX - startX);
  const dy = Math.abs(endY - startY);
  const sx = startX < endX ? 1 : -1;
  const sy = startY < endY ? 1 : -1;
  let err = dx - dy;

  let next = cells;

  while (true) {
    if (x >= 0 && x < width && y >= 0 && y < height) {
      const index = y * width + x;
      next = setCell(next, index, value);
    }

    if (x === endX && y === endY) {
      break;
    }

    const e2 = err * 2;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return next;
}

export function paintBrush(
  cells: CellValue[],
  centerIndex: number,
  value: CellValue,
  width: number,
  radius: number
): CellValue[] {
  if (radius <= 0) {
    return setCell(cells, centerIndex, value);
  }

  const height = Math.ceil(cells.length / width);
  const centerX = centerIndex % width;
  const centerY = Math.floor(centerIndex / width);
  let next = cells;

  for (let y = centerY - radius; y <= centerY + radius; y += 1) {
    if (y < 0 || y >= height) {
      continue;
    }
    for (let x = centerX - radius; x <= centerX + radius; x += 1) {
      if (x < 0 || x >= width) {
        continue;
      }
      const dx = x - centerX;
      const dy = y - centerY;
      if (dx * dx + dy * dy > radius * radius) {
        continue;
      }
      next = setCell(next, y * width + x, value);
    }
  }

  return next;
}

export function paintBrushLine(
  cells: CellValue[],
  fromIndex: number,
  toIndex: number,
  value: CellValue,
  width: number,
  radius: number
): CellValue[] {
  const height = Math.ceil(cells.length / width);
  const startX = fromIndex % width;
  const startY = Math.floor(fromIndex / width);
  const endX = toIndex % width;
  const endY = Math.floor(toIndex / width);

  let x = startX;
  let y = startY;
  const dx = Math.abs(endX - startX);
  const dy = Math.abs(endY - startY);
  const sx = startX < endX ? 1 : -1;
  const sy = startY < endY ? 1 : -1;
  let err = dx - dy;
  let next = cells;

  while (true) {
    if (x >= 0 && x < width && y >= 0 && y < height) {
      next = paintBrush(next, y * width + x, value, width, radius);
    }
    if (x === endX && y === endY) {
      break;
    }
    const e2 = err * 2;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return next;
}

export function pushHistory(state: HistoryState, nextPresent: CellValue[]): HistoryState {
  if (nextPresent === state.present) {
    return state;
  }

  const past =
    state.past.length >= HISTORY_LIMIT
      ? [...state.past.slice(1), state.present]
      : [...state.past, state.present];

  return {
    past,
    present: nextPresent,
    future: [],
  };
}

export function undoHistory(state: HistoryState): HistoryState {
  if (state.past.length === 0) {
    return state;
  }

  const previous = state.past[state.past.length - 1];
  return {
    past: state.past.slice(0, -1),
    present: previous,
    future: [state.present, ...state.future],
  };
}

export function redoHistory(state: HistoryState): HistoryState {
  if (state.future.length === 0) {
    return state;
  }

  const next = state.future[0];
  return {
    past: [...state.past, state.present],
    present: next,
    future: state.future.slice(1),
  };
}

export function serializeProject(project: MapProjectV1): string {
  return JSON.stringify(project, null, 2);
}

export function parseProject(raw: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Invalid JSON file." };
  }

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "Project must be an object." };
  }

  const data = parsed as Partial<MapProjectV1>;
  if (data.version !== PROJECT_VERSION) {
    return { ok: false, error: "Unsupported project version." };
  }
  if (typeof data.name !== "string" || data.name.trim() === "") {
    return { ok: false, error: "Project name is required." };
  }
  if (!Number.isInteger(data.width) || !Number.isInteger(data.height) || data.width! <= 0 || data.height! <= 0) {
    return { ok: false, error: "Project dimensions are invalid." };
  }
  if (!Array.isArray(data.cells) || data.cells.length !== data.width! * data.height!) {
    return { ok: false, error: "Project cell data is invalid." };
  }

  for (const cell of data.cells) {
    if (cell !== null && (typeof cell !== "string" || !validTerrains.has(cell as TerrainId))) {
      return { ok: false, error: "Project contains unsupported terrain." };
    }
  }

  const width = data.width as number;
  const height = data.height as number;

  return {
    ok: true,
    project: {
      version: 1,
      name: data.name,
      width,
      height,
      cells: data.cells as CellValue[],
    },
  };
}
