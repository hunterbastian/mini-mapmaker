import classNames from "classnames";
import { CellValue } from "@/lib/project";
import { tileById } from "@/lib/tiles";

type GridCellProps = {
  index: number;
  value: CellValue;
  onPointerDown: (index: number) => void;
  onPointerEnter: (index: number) => void;
};

export default function GridCell({ index, value, onPointerDown, onPointerEnter }: GridCellProps) {
  const tile = value ? tileById.get(value) : null;

  return (
    <button
      type="button"
      className={classNames("grid-cell", { filled: Boolean(tile) })}
      onPointerDown={() => onPointerDown(index)}
      onPointerEnter={() => onPointerEnter(index)}
      aria-label={`Map cell ${index + 1}`}
    >
      {tile ? (
        <div
          className={classNames("tile", tile.className)}
          dangerouslySetInnerHTML={{ __html: tile.svg }}
        />
      ) : null}
    </button>
  );
}
