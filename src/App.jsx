import { useMemo, useState } from "react";
import Header from "./components/Header";
import ScrapeForm from "./components/ScrapeForm";
import PageList from "./components/PageList";
import PageView from "./components/PageView";

function App() {
  const backendUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || "http://localhost:8000", []);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      <Header onSearch={setFilter} />
      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-1 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
            <h2 className="text-slate-100 font-semibold mb-3">Scrape site</h2>
            <ScrapeForm backendUrl={backendUrl} onDone={() => setRefreshKey((k) => k + 1)} />
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
            <h2 className="text-slate-100 font-semibold mb-3">Saved pages</h2>
            <PageList key={refreshKey} backendUrl={backendUrl} filter={filter} onSelect={setSelected} />
          </div>
        </section>
        <section className="md:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 min-h-[300px]">
          <PageView backendUrl={backendUrl} selected={selected} />
        </section>
      </main>
    </div>
  );
}

export default App;
