import classNames from "classnames";
import { EditorTool } from "@/lib/project";

type EditorToolbarProps = {
  tool: EditorTool;
  brushSize: number;
  canUndo: boolean;
  canRedo: boolean;
  onSetTool: (tool: EditorTool) => void;
  onSetBrushSize: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
};

export default function EditorToolbar({
  tool,
  brushSize,
  canUndo,
  canRedo,
  onSetTool,
  onSetBrushSize,
  onUndo,
  onRedo,
  onClear,
}: EditorToolbarProps) {
  return (
    <div className="editor-toolbar">
      <div className="tool-group" role="group" aria-label="Editor tools">
        <button
          type="button"
          className={classNames("toolbar-button", { active: tool === "paint" })}
          onClick={() => onSetTool("paint")}
        >
          Paint (P)
        </button>
        <button
          type="button"
          className={classNames("toolbar-button", { active: tool === "brush" })}
          onClick={() => onSetTool("brush")}
        >
          Brush (B)
        </button>
        <button
          type="button"
          className={classNames("toolbar-button", { active: tool === "erase" })}
          onClick={() => onSetTool("erase")}
        >
          Erase (E)
        </button>
      </div>

      <div className="tool-group" role="group" aria-label="History controls">
        <button type="button" className="toolbar-button" onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" className="toolbar-button" onClick={onRedo} disabled={!canRedo}>
          Redo
        </button>
      </div>

      <div className="tool-group" role="group" aria-label="Brush size">
        {[1, 2, 3].map((size) => (
          <button
            key={size}
            type="button"
            className={classNames("toolbar-button brush-size", { active: brushSize === size })}
            onClick={() => onSetBrushSize(size)}
          >
            {size === 1 ? "Fine" : size === 2 ? "Wide" : "Broad"}
          </button>
        ))}
      </div>

      <button type="button" className="toolbar-button danger" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}
