import { ChangeEvent, useRef, useState } from "react";
import { MapProjectV1, parseProject, serializeProject } from "@/lib/project";

type ProjectIOProps = {
  project: MapProjectV1;
  onImportProject: (project: MapProjectV1) => void;
};

export default function ProjectIO({ project, onImportProject }: ProjectIOProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportJson = () => {
    const blob = new Blob([serializeProject(project)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mini-mapmaker-project.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const text = await file.text();
    const parsed = parseProject(text);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    setError(null);
    onImportProject(parsed.project);
  };

  return (
    <div className="project-io">
      <div className="tool-group">
        <button type="button" className="toolbar-button" onClick={handleExportJson}>
          Export JSON
        </button>
        <button
          type="button"
          className="toolbar-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Import JSON
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileSelect}
        hidden
      />
      {error ? <div className="io-error">{error}</div> : null}
    </div>
  );
}
