import classNames from "classnames";
import { Tile, tiles } from "@/lib/tiles";
import { TerrainId } from "@/lib/project";

type TileCardProps = {
  tile: Tile;
  isSelected: boolean;
  onSelect: (tileId: TerrainId) => void;
};

function TileCard({ tile, isSelected, onSelect }: TileCardProps) {
  return (
    <button
      type="button"
      className={classNames("tile-card", { selected: isSelected })}
      onClick={() => onSelect(tile.id)}
    >
      <div
        className={classNames("tile", tile.className)}
        dangerouslySetInnerHTML={{ __html: tile.svg }}
      />
      <div className="tile-label">{tile.name}</div>
    </button>
  );
}

type TilePaletteProps = {
  selectedTerrain: TerrainId;
  onSelectTerrain: (terrainId: TerrainId) => void;
};

export default function TilePalette({ selectedTerrain, onSelectTerrain }: TilePaletteProps) {
  return (
    <section className="panel sidebar">
      <div className="panel-title">Terrain Library</div>
      <div className="tile-grid">
        {tiles.map((tile) => (
          <TileCard
            key={tile.id}
            tile={tile}
            isSelected={selectedTerrain === tile.id}
            onSelect={onSelectTerrain}
          />
        ))}
      </div>
      <div className="legend">Select terrain, then paint onto the grid.</div>
    </section>
  );
}
