import type { RefObject } from "react";
import GridCell from "@/components/GridCell";
import { CellValue } from "@/lib/project";

type MapGridProps = {
  width: number;
  height: number;
  cellSize: number;
  cells: CellValue[];
  onCellPointerDown: (index: number) => void;
  onCellPointerEnter: (index: number) => void;
  onGridPointerUp: () => void;
  onGridPointerLeave: () => void;
  mapRef?: RefObject<HTMLDivElement>;
};

export default function MapGrid({
  width,
  height,
  cellSize,
  cells,
  onCellPointerDown,
  onCellPointerEnter,
  onGridPointerUp,
  onGridPointerLeave,
  mapRef,
}: MapGridProps) {
  return (
    <div className="map-frame" id="map-canvas" ref={mapRef}>
      <div
        className="map-grid"
        onPointerUp={onGridPointerUp}
        onPointerLeave={onGridPointerLeave}
        style={{
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
          ["--cell" as string]: `${cellSize}px`,
        }}
      >
        {cells.map((value, index) => (
          <GridCell
            key={index}
            index={index}
            value={value}
            onPointerDown={onCellPointerDown}
            onPointerEnter={onCellPointerEnter}
          />
        ))}
      </div>
    </div>
  );
}
