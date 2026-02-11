"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EditorToolbar from "@/components/EditorToolbar";
import ExportButton from "@/components/ExportButton";
import MapGrid from "@/components/MapGrid";
import ProjectIO from "@/components/ProjectIO";
import TilePalette from "@/components/TilePalette";
import {
  CellValue,
  createEmptyProject,
  createHistory,
  EditorTool,
  HistoryState,
  MapProjectV1,
  paintLine,
  pushHistory,
  redoHistory,
  setCell,
  TerrainId,
  undoHistory,
} from "@/lib/project";
import { loadProject, scheduleSaveProject } from "@/lib/storage";

const DEFAULT_WIDTH = 20;
const DEFAULT_HEIGHT = 12;
const CELL_SIZE = 48;
const DEFAULT_TERRAIN: TerrainId = "grass";

export default function HomePage() {
  const [projectMeta, setProjectMeta] = useState(() => {
    const seed = createEmptyProject(DEFAULT_WIDTH, DEFAULT_HEIGHT);
    return { name: seed.name, width: seed.width, height: seed.height };
  });
  const [history, setHistory] = useState<HistoryState>(() => {
    const seed = createEmptyProject(DEFAULT_WIDTH, DEFAULT_HEIGHT);
    return createHistory(seed.cells);
  });
  const [tool, setTool] = useState<EditorTool>("paint");
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainId>(DEFAULT_TERRAIN);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const isPaintingRef = useRef(false);
  const lastPaintedIndexRef = useRef<number | null>(null);

  const project: MapProjectV1 = useMemo(
    () => ({
      version: 1,
      name: projectMeta.name,
      width: projectMeta.width,
      height: projectMeta.height,
      cells: history.present,
    }),
    [projectMeta, history.present]
  );

  const applyValue = tool === "erase" ? null : selectedTerrain;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;
  const paintedCells = useMemo(
    () => history.present.reduce((count, cell) => (cell ? count + 1 : count), 0),
    [history.present]
  );

  const paintCell = useCallback(
    (index: number, connectFrom: number | null) => {
      if (index < 0 || index >= projectMeta.width * projectMeta.height) {
        return;
      }

      setHistory((prev) => {
        let nextCells = prev.present;
        if (connectFrom === null) {
          nextCells = setCell(nextCells, index, applyValue);
        } else {
          nextCells = paintLine(nextCells, connectFrom, index, applyValue, projectMeta.width);
        }
        return pushHistory(prev, nextCells);
      });
    },
    [applyValue, projectMeta.height, projectMeta.width]
  );

  const handleCellPointerDown = useCallback(
    (index: number) => {
      isPaintingRef.current = true;
      paintCell(index, null);
      lastPaintedIndexRef.current = index;
    },
    [paintCell]
  );

  const handleCellPointerEnter = useCallback(
    (index: number) => {
      if (!isPaintingRef.current) {
        return;
      }
      const origin = lastPaintedIndexRef.current;
      if (origin === index) {
        return;
      }
      paintCell(index, origin);
      lastPaintedIndexRef.current = index;
    },
    [paintCell]
  );

  const stopPainting = useCallback(() => {
    isPaintingRef.current = false;
    lastPaintedIndexRef.current = null;
  }, []);

  const handleUndo = useCallback(() => {
    setHistory((prev) => undoHistory(prev));
  }, []);

  const handleRedo = useCallback(() => {
    setHistory((prev) => redoHistory(prev));
  }, []);

  const handleClear = useCallback(() => {
    const confirmed = window.confirm("Clear the entire map?");
    if (!confirmed) {
      return;
    }
    const empty = Array.from({ length: history.present.length }, () => null as CellValue);
    setHistory((prev) => pushHistory(prev, empty));
  }, [history.present.length]);

  const handleImportProject = useCallback((importedProject: MapProjectV1) => {
    setProjectMeta({
      name: importedProject.name,
      width: importedProject.width,
      height: importedProject.height,
    });
    setHistory(createHistory(importedProject.cells));
    stopPainting();
  }, [stopPainting]);

  useEffect(() => {
    const saved = loadProject();
    if (!saved) {
      return;
    }
    setProjectMeta({ name: saved.name, width: saved.width, height: saved.height });
    setHistory(createHistory(saved.cells));
  }, []);

  useEffect(() => {
    scheduleSaveProject(project);
  }, [project]);

  useEffect(() => {
    const onPointerUp = () => stopPainting();
    window.addEventListener("pointerup", onPointerUp);
    return () => window.removeEventListener("pointerup", onPointerUp);
  }, [stopPainting]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isUndo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !event.shiftKey;
      const isRedoShortcut =
        (event.metaKey || event.ctrlKey) &&
        ((event.key.toLowerCase() === "z" && event.shiftKey) || event.key.toLowerCase() === "y");

      if (isUndo) {
        event.preventDefault();
        handleUndo();
        return;
      }
      if (isRedoShortcut) {
        event.preventDefault();
        handleRedo();
        return;
      }

      if (event.key.toLowerCase() === "b") {
        setTool("paint");
      }
      if (event.key.toLowerCase() === "e") {
        setTool("erase");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleRedo, handleUndo]);

  return (
    <main>
      <div className="app-shell">
        <header className="top-bar">
          <div className="brand-block">
            <div className="brand-title">OUTPOST MAP</div>
            <div className="brand-subtitle">Ambient cartography console</div>
          </div>

          <div className="header-tools">
            <span className="status-chip">online</span>
            <ExportButton target={mapRef.current} />
          </div>
        </header>

        <div className="layout">
          <section className="panel map-shell">
            <div className="map-meta">
              <span>
                Grid {projectMeta.width} x {projectMeta.height}
              </span>
              <span>{paintedCells} active</span>
            </div>

            <MapGrid
              width={projectMeta.width}
              height={projectMeta.height}
              cellSize={CELL_SIZE}
              cells={history.present}
              onCellPointerDown={handleCellPointerDown}
              onCellPointerEnter={handleCellPointerEnter}
              onGridPointerUp={stopPainting}
              onGridPointerLeave={stopPainting}
              mapRef={mapRef}
            />
          </section>

          <section className="panel command-shell">
            <div className="sector-head">
              <div>
                <h1 className="sector-title">Outpost Controls</h1>
                <p className="sector-subtitle">Silent mode • local autosave</p>
              </div>
              <span className="sector-badge">{tool === "paint" ? "Paint" : "Erase"}</span>
            </div>

            <div className="intel-strip" aria-label="Editor telemetry">
              <span>terrain {selectedTerrain}</span>
              <span>history {history.past.length}</span>
              <span>cells {paintedCells}</span>
            </div>

            <EditorToolbar
              tool={tool}
              canUndo={canUndo}
              canRedo={canRedo}
              onSetTool={setTool}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onClear={handleClear}
            />

            <ProjectIO project={project} onImportProject={handleImportProject} />
            <TilePalette selectedTerrain={selectedTerrain} onSelectTerrain={setSelectedTerrain} />
          </section>
        </div>
      </div>
    </main>
  );
}
