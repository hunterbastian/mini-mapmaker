import { useState } from "react";
import { toPng } from "html-to-image";

type ExportButtonProps = {
  target: HTMLElement | null;
};

export default function ExportButton({ target }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!target || isExporting) {
      return;
    }
    setIsExporting(true);
    try {
      const dataUrl = await toPng(target, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#05070d",
      });
      const link = document.createElement("a");
      link.download = "cartographer-map.png";
      link.href = dataUrl;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="export-button"
      onClick={handleExport}
      type="button"
      disabled={!target || isExporting}
    >
      {isExporting ? "Rendering..." : "Export PNG"}
    </button>
  );
}
