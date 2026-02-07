import classNames from "classnames";
import { EditorTool } from "@/lib/project";

type EditorToolbarProps = {
  tool: EditorTool;
  canUndo: boolean;
  canRedo: boolean;
  onSetTool: (tool: EditorTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
};

export default function EditorToolbar({
  tool,
  canUndo,
  canRedo,
  onSetTool,
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
          Paint (B)
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

      <button type="button" className="toolbar-button danger" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}
