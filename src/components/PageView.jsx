import { useEffect, useMemo, useState } from "react";

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

function ConversionList({ items }) {
  if (!items?.length) return (
    <div className="text-slate-400">No conversion rates extracted yet.</div>
  );
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.id || `${it.source}-${it.target}-${it.rate}`}
          className="flex items-center justify-between gap-3 p-2 border border-slate-800/70 rounded-md bg-slate-900/40">
          <div className="text-slate-200 text-sm">
            <span className="font-medium">1 {it.source}</span>
            <span className="mx-2 text-slate-400">→</span>
            <span className="font-medium">{it.rate} {it.target}</span>
          </div>
          {it.text && <div className="text-xs text-slate-500 truncate max-w-[50%]">{it.text}</div>}
        </div>
      ))}
    </div>
  );
}

export default function PageView({ backendUrl, selected }) {
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [rates, setRates] = useState([]);

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

  useEffect(() => {
    async function loadRates() {
      if (!selected) return;
      try {
        const res = await fetch(`${backendUrl}/api/conversions?page_url=${encodeURIComponent(selected.url)}`);
        const data = await res.json();
        setRates(data.items || []);
      } catch {
        setRates([]);
      }
    }
    loadRates();
  }, [backendUrl, selected]);

  async function handleExtract(ocr=false) {
    if (!selected) return;
    setExtracting(true);
    try {
      const res = await fetch(`${backendUrl}/api/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: selected.url, ocr })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Extraction failed');
      // reload rates
      const r = await fetch(`${backendUrl}/api/conversions?page_url=${encodeURIComponent(selected.url)}`);
      const d = await r.json();
      setRates(d.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setExtracting(false);
    }
  }

  if (!selected) return <div className="text-slate-400">Select a page to view details</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!page) return <div className="text-slate-300">Loading…</div>;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold text-slate-100">{page.title || page.path}</div>
        <div className="text-slate-400 text-sm break-all">{page.url}</div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => handleExtract(false)} disabled={extracting}
          className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm">
          {extracting ? 'Extracting…' : 'Extract text conversions'}
        </button>
        <button onClick={() => handleExtract(true)} disabled={extracting}
          className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-sm">
          {extracting ? 'Extracting…' : 'Extract + image metadata'}
        </button>
      </div>
      <div className="space-y-2">
        <h3 className="text-slate-100 font-medium">Detected Conversion Rates</h3>
        <ConversionList items={rates} />
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
