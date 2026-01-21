import React, { useEffect, useState } from 'react';
import { Play, Code2 } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, onRun }) => {
  const [srcDoc, setSrcDoc] = useState('');

  // Debounced update or manual run? 
  // We'll stick to manual run for the "Task" feel, but initial load renders.
  useEffect(() => {
    setSrcDoc(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  const handleRun = () => {
    setSrcDoc(code);
    onRun();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2 text-purple-400 font-mono text-sm">
          <Code2 size={16} />
          <span>index.html</span>
        </div>
        <button
          onClick={handleRun}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-1.5 rounded-full text-sm transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
        >
          <Play size={14} fill="currentColor" />
          RUN
        </button>
      </div>

      {/* Split View */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Editor */}
        <div className="flex-1 relative group">
          <textarea
            value={code}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full bg-slate-950 p-4 font-mono text-sm text-green-400 resize-none focus:outline-none selection:bg-purple-500/30"
            spellCheck={false}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 text-xs text-slate-500 pointer-events-none">
            EDITOR
          </div>
        </div>

        {/* Divider */}
        <div className="h-2 md:h-full md:w-2 bg-slate-800 border-t md:border-t-0 md:border-l border-slate-700"></div>

        {/* Preview */}
        <div className="flex-1 bg-white relative">
          <iframe
            title="preview"
            srcDoc={srcDoc}
            className="w-full h-full border-none"
            sandbox="allow-scripts"
          />
           <div className="absolute top-2 right-2 bg-black/10 px-2 py-1 rounded text-xs text-black/50 pointer-events-none font-bold backdrop-blur-sm">
            LIVE PREVIEW
          </div>
        </div>
      </div>
    </div>
  );
};
