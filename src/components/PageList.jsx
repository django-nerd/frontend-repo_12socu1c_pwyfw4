import { useEffect, useMemo, useState } from "react";

export default function PageList({ backendUrl, filter, onSelect }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${backendUrl}/api/pages`);
        const data = await res.json();
        setItems(data.items || []);
      } catch (e) {
        setError("Failed to load pages");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [backendUrl]);

  const filtered = useMemo(() => {
    const f = (filter || "").toLowerCase();
    if (!f) return items;
    return items.filter((it) =>
      (it.title || "").toLowerCase().includes(f) || (it.path || "").toLowerCase().includes(f)
    );
  }, [items, filter]);

  if (loading) return <div className="text-slate-300">Loading pages…</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  if (!filtered.length)
    return <div className="text-slate-400">No pages yet. Use the form to scrape.</div>;

  return (
    <ul className="divide-y divide-slate-800/80 border border-slate-800/80 rounded-lg overflow-hidden">
      {filtered.map((it) => (
        <li
          key={it.id}
          onClick={() => onSelect?.(it)}
          className="p-3 hover:bg-slate-800/50 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-slate-200 text-sm font-medium">{it.title || it.path}</div>
              <div className="text-slate-400 text-xs truncate">{it.url}</div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div>Tables: {it.table_count}</div>
              {typeof it.conversion_count === 'number' && (
                <div>Rates: {it.conversion_count}</div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
