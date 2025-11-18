import { Search } from "lucide-react";
import { useState } from "react";

export default function Header({ onSearch }) {
  const [value, setValue] = useState("");
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-slate-900/60 border-b border-slate-700/50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <img src="/flame-icon.svg" alt="logo" className="w-8 h-8" />
        <h1 className="text-white font-semibold tracking-tight">Ball TD Conversions</h1>
        <div className="ml-auto relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder="Filter pages by title or path..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-slate-800/60 border border-slate-700/60 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          />
        </div>
      </div>
    </header>
  );
}
