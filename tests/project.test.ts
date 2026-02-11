import test from "node:test";
import assert from "node:assert/strict";
import {
  createEmptyProject,
  createHistory,
  paintBrush,
  paintBrushLine,
  paintLine,
  parseProject,
  pushHistory,
  redoHistory,
  serializeProject,
  setCell,
  undoHistory,
} from "../lib/project";

test("createEmptyProject creates expected grid size", () => {
  const project = createEmptyProject(4, 3, "Test");
  assert.equal(project.cells.length, 12);
  assert.equal(project.cells.filter((cell) => cell === null).length, 12);
});

test("setCell updates only one index", () => {
  const start = [null, null, null, null];
  const next = setCell(start, 2, "forest");
  assert.deepEqual(next, [null, null, "forest", null]);
  assert.notEqual(next, start);
});

test("paintLine paints path between indices", () => {
  const start = Array.from({ length: 16 }, () => null);
  const next = paintLine(start, 0, 15, "water", 4);
  assert.equal(next[0], "water");
  assert.equal(next[5], "water");
  assert.equal(next[10], "water");
  assert.equal(next[15], "water");
});

test("paintBrush paints a circular area around target cell", () => {
  const start = Array.from({ length: 25 }, () => null);
  const next = paintBrush(start, 12, "forest", 5, 1);
  assert.equal(next[12], "forest");
  assert.equal(next[7], "forest");
  assert.equal(next[11], "forest");
  assert.equal(next[13], "forest");
  assert.equal(next[17], "forest");
});

test("paintBrushLine paints along drag path with brush radius", () => {
  const start = Array.from({ length: 25 }, () => null);
  const next = paintBrushLine(start, 0, 24, "grass", 5, 1);
  assert.equal(next[0], "grass");
  assert.equal(next[6], "grass");
  assert.equal(next[12], "grass");
  assert.equal(next[24], "grass");
});

test("undo and redo move through history", () => {
  const empty = [null, null, null, null];
  const painted = setCell(empty, 0, "grass");
  const paintedTwice = setCell(painted, 1, "forest");

  let history = createHistory(empty);
  history = pushHistory(history, painted);
  history = pushHistory(history, paintedTwice);
  history = undoHistory(history);
  assert.deepEqual(history.present, painted);
  history = redoHistory(history);
  assert.deepEqual(history.present, paintedTwice);
});

test("redo stack clears after new changes", () => {
  const empty = [null, null, null, null];
  const painted = setCell(empty, 0, "grass");
  const alternate = setCell(empty, 2, "mountain");

  let history = createHistory(empty);
  history = pushHistory(history, painted);
  history = undoHistory(history);
  assert.equal(history.future.length, 1);
  history = pushHistory(history, alternate);
  assert.equal(history.future.length, 0);
});

test("parseProject validates good and bad project payloads", () => {
  const project = createEmptyProject(2, 2, "Import Test");
  const valid = parseProject(serializeProject(project));
  assert.equal(valid.ok, true);

  const wrongVersion = parseProject(
    JSON.stringify({ ...project, version: 99 })
  );
  assert.equal(wrongVersion.ok, false);

  const badTerrain = parseProject(
    JSON.stringify({ ...project, cells: ["lava", null, null, null] })
  );
  assert.equal(badTerrain.ok, false);
});
