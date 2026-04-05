import { useState, useEffect, useRef } from 'react';
import { Play, Square, Search, Terminal } from 'lucide-react';
import { useAdminApi } from '../hooks/useAdminApi';

export default function ScriptsDashboard() {
  const [scripts, setScripts] = useState<string[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  
  const [args, setArgs] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<{ id: string; text: string; type: 'info' | 'error' | 'stdout' | 'stderr' | 'success' }[]>([]);
  const { fetchApi } = useAdminApi();
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetchApi('/api/admin/scripts')
      .then((data) => {
        setScripts(data.scripts || []);
        setFilteredScripts(data.scripts || []);
      })
      .catch((err) => {
        setLogs([{ id: Math.random().toString(), text: `Error fetching scripts: ${err.message}`, type: 'error' }]);
      });
  }, [fetchApi]);

  useEffect(() => {
    setFilteredScripts(scripts.filter(s => s.toLowerCase().includes(query.toLowerCase())));
  }, [query, scripts]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const selectScript = (name: string) => {
    setSelectedScript(name);
    setArgs('');
  };

  const clearTerm = () => setLogs([{ id: Math.random().toString(), text: `Ready to execute ${selectedScript}.`, type: 'info' }]);

  const logToTerm = (text: string, type: 'info' | 'error' | 'stdout' | 'stderr' | 'success' = 'info') => {
    const lines = text.toString().split('\\n').filter(Boolean);
    const newLogs = lines.map((line) => ({ id: Math.random().toString(), text: line, type }));
    setLogs((prev) => [...prev, ...newLogs]);
  };

  const runScript = () => {
    if (!selectedScript) return;
    clearTerm();
    
    const rawArgs = args.split(',').map(s => s.trim()).filter(Boolean);
    const argStr = JSON.stringify(rawArgs);
    
    logToTerm(`$ node scripts/${selectedScript} ${rawArgs.join(' ')}\n`, 'info');
    setIsRunning(true);

    const url = new URL(`/api/admin/scripts/${selectedScript}/stream`, window.location.origin);
    url.searchParams.set('args', argStr);

    const eventSource = new EventSource(url.href);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        switch (payload.type) {
          case 'stdout': logToTerm(payload.data, 'stdout'); break;
          case 'stderr': logToTerm(payload.data, 'stderr'); break;
          case 'error': logToTerm(`[ERROR] ${payload.data}`, 'error'); break;
          case 'done':
            logToTerm(`\n[Process exited with code ${payload.code}]`, payload.code === 0 ? 'success' : 'error');
            eventSource.close();
            setIsRunning(false);
            break;
        }
      } catch (err: any) {
        logToTerm(e.data, 'stdout');
      }
    };

    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) return;
      logToTerm(`[Stream Error] Connection lost.`, 'error');
      eventSource.close();
      setIsRunning(false);
    };
  };

  const stopScript = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      logToTerm(`\n[Process terminated by user]`, 'error');
      setIsRunning(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Script List */}
      <aside className="w-64 border-r border-white/5 flex flex-col shrink-0 bg-transparent relative">
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter scripts..."
              className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-white/30"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredScripts.length === 0 && <div className="text-center p-4 text-xs text-white/40">No scripts found.</div>}
          {filteredScripts.map((script) => (
            <div
              key={script}
              onClick={() => selectScript(script)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border text-sm font-mono ${
                selectedScript === script
                  ? 'bg-primary/20 border-primary/30 text-white'
                  : 'hover:bg-white/5 border-transparent text-white/70'
              }`}
            >
              <Terminal className={`w-4 h-4 ${selectedScript === script ? 'text-primary' : 'text-white/30'}`} />
              <span className="truncate">{script}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Terminal View */}
      <section className="flex-1 flex flex-col min-w-0 bg-black/40">
        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between shrink-0 h-[88px]">
          <div>
            <h2 className="text-2xl font-bold text-white/90 tracking-tight flex items-center gap-3">
              <span className="text-white/30">/</span> {selectedScript || 'Select script'}
            </h2>
          </div>
          <div className={`flex gap-3 transition-opacity duration-300 ${!selectedScript ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <input
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              disabled={isRunning}
              placeholder="Args (comma seq)..."
              className="w-64 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none text-white placeholder:text-white/30 font-mono disabled:opacity-50"
            />
            {!isRunning ? (
              <button
                onClick={runScript}
                className="bg-primary hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95"
              >
                <Play className="w-4 h-4" /> Execute
              </button>
            ) : (
              <button
                onClick={stopScript}
                className="bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all active:scale-95"
              >
                <Square className="w-4 h-4" /> Stop
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 p-6 relative overflow-hidden flex flex-col">
          <div className="absolute top-6 left-6 right-6 h-8 bg-black/60 rounded-t-xl border border-white/10 border-b-0 flex items-center px-4 gap-2 z-10 backdrop-blur-md">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="flex-1 text-center text-xs font-mono text-white/30 truncate px-4">
              {selectedScript ? `node scripts/${selectedScript}` : 'terminal - ksh'}
            </div>
          </div>
          <div ref={terminalRef} className="flex-1 bg-black/80 rounded-b-xl border border-white/10 p-4 pt-10 font-mono text-sm overflow-y-auto shadow-2xl space-y-1">
            {logs.length === 0 && (
              <>
                <span className="text-white/30 block mb-1">Welcome to KwikTwik Commander.</span>
                <span className="text-white/30 block mb-1">Select a script from the sidebar and execute.</span>
              </>
            )}
            {logs.map((log) => (
              <span
                key={log.id}
                className={`block break-all mb-0.5 ${
                  log.type === 'error' || log.type === 'stderr' ? 'text-red-400'
                    : log.type === 'success' ? 'text-green-400'
                    : log.type === 'info' ? 'text-blue-300'
                    : 'text-gray-300'
                }`}
              >
                {log.text}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
