import { useEffect, useState } from "react";

function Table({ t }) {
  if (!t?.rows?.length) return null;
  const headers = t.headers && t.headers.length ? t.headers : Array.from({ length: t.rows[0].length }, (_, i) => `Col ${i+1}`);
  return (
    <div className="overflow-x-auto border border-slate-800/80 rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-800/60">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="text-left px-3 py-2 text-slate-300 font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.rows.map((r, ri) => (
            <tr key={ri} className={ri % 2 ? "bg-slate-900/30" : ""}>
              {r.map((c, ci) => (
                <td key={ci} className="px-3 py-2 text-slate-200 whitespace-nowrap">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PageView({ backendUrl, selected }) {
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!selected) return;
      setError("");
      try {
        const res = await fetch(`${backendUrl}/api/page?url=${encodeURIComponent(selected.url)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to load");
        setPage(data);
      } catch (e) {
        setError(e.message);
      }
    }
    load();
  }, [backendUrl, selected]);

  if (!selected) return <div className="text-slate-400">Select a page to view details</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!page) return <div className="text-slate-300">Loading…</div>;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold text-slate-100">{page.title || page.path}</div>
        <div className="text-slate-400 text-sm break-all">{page.url}</div>
      </div>
      <div className="space-y-6">
        {page.tables?.length ? (
          page.tables.map((t, i) => (
            <div key={i} className="space-y-2">
              <div className="text-slate-300 text-sm">Table {i + 1}</div>
              <Table t={t} />
            </div>
          ))
        ) : (
          <div className="text-slate-400">No tables detected on this page.</div>
        )}
      </div>
    </div>
  );
}
