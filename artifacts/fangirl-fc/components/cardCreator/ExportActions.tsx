"use client";

interface Props {
  exporting: boolean;
  onDownload: () => void;
  onShare: () => void;
}

export default function ExportActions({ exporting, onDownload, onShare }: Props) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onDownload}
        disabled={exporting}
        className="flex-1 py-3.5 rounded-xl bg-pink-600 hover:bg-pink-500 active:scale-95 transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
      >
        {exporting ? (
          <span className="animate-pulse">Exporting…</span>
        ) : (
          <>
            <span>⬇</span>
            <span>Download</span>
          </>
        )}
      </button>
      <button
        onClick={onShare}
        disabled={exporting}
        className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all font-bold text-sm text-white disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2 border border-white/15"
      >
        <span>↑</span>
        <span>Share</span>
      </button>
    </div>
  );
}
