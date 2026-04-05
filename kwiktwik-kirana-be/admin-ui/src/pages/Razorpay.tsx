import { useState } from 'react';
import { useAdminApi } from '../hooks/useAdminApi';
import { SyntaxHighlight } from '../components/SyntaxHighlight';
import { Search, List, Activity, CreditCard, RefreshCcw, XCircle } from 'lucide-react';

export default function Razorpay() {
  const { fetchApi } = useAdminApi();
  const [appId, setAppId] = useState('');
  const [userId, setUserId] = useState('');
  
  const [statusId, setStatusId] = useState('');
  const [orderLimit, setOrderLimit] = useState('');
  const [syncId, setSyncId] = useState('');
  const [cancelId, setCancelId] = useState('');

  const [results, setResults] = useState<{ id: string; content: any; isError: boolean }[]>([]);

  const addResult = (content: any, isError = false) => {
    setResults(prev => [...prev, { id: Math.random().toString(), content, isError }]);
  };

  const clearResults = () => setResults([]);

  const handleFetchSubs = async () => {
    if (!appId || !userId) return addResult({ error: 'App ID and User ID required' }, true);
    try {
      addResult({ loading: 'Fetching subscriptions...' });
      const data = await fetchApi(`/api/admin/razorpay/subscriptions?userId=${userId}&appId=${appId}`);
      addResult(data);
    } catch (err: any) { addResult({ error: err.message }, true); }
  };

  const handleCheckStatus = async () => {
    if (!appId || !statusId) return addResult({ error: 'App ID and Sub ID required' }, true);
    try {
      addResult({ loading: 'Fetching subscription status...' });
      const data = await fetchApi(`/api/admin/razorpay/subscriptions/${statusId}/status?appId=${appId}`);
      addResult(data);
    } catch (err: any) { addResult({ error: err.message }, true); }
  };

  const handleGetOrders = async () => {
    if (!appId || !userId) return addResult({ error: 'App ID and User ID required' }, true);
    const limit = orderLimit || 50;
    try {
      addResult({ loading: 'Fetching orders...' });
      const data = await fetchApi(`/api/admin/razorpay/orders?userId=${userId}&appId=${appId}&limit=${limit}`);
      addResult(data);
    } catch (err: any) { addResult({ error: err.message }, true); }
  };

  const handleSyncSub = async () => {
    if (!appId || !syncId) return addResult({ error: 'App ID and Sub ID required' }, true);
    try {
      addResult({ loading: 'Syncing subscription status...' });
      const data = await fetchApi(`/api/admin/razorpay/subscriptions/${syncId}/sync?appId=${appId}`, { method: 'POST' });
      addResult(data);
    } catch (err: any) { addResult({ error: err.message }, true); }
  };

  const handleCancelSub = async () => {
    if (!appId || !cancelId) return addResult({ error: 'App ID and Sub ID required' }, true);
    try {
      addResult({ loading: 'Canceling subscription...' });
      const data = await fetchApi(`/api/admin/razorpay/subscriptions/${cancelId}/cancel?appId=${appId}`, { method: 'POST' });
      addResult(data);
    } catch (err: any) { addResult({ error: err.message }, true); }
  };

  const handleFetchPlans = async () => {
    if (!appId) return addResult({ error: 'App ID required' }, true);
    try {
      addResult({ loading: 'Fetching plans...' });
      const data = await fetchApi(`/api/admin/razorpay/plans?appId=${appId}`);
      addResult(data);
    } catch (err: any) { addResult({ error: err.message }, true); }
  };

  return (
    <div className="flex-1 p-6 overflow-auto bg-black/20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title inside Content Area instead of fixed top */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white/90">Razorpay Operations</h2>
          <p className="text-white/50 text-sm">Manage payment & subscription states via Razorpay integration</p>
        </div>

        {/* Common Params */}
        <div className="glass-panel rounded-xl p-6 border-l-4 border-l-razorpay-accent">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Common Credentials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase font-medium tracking-wide">App ID</label>
              <input value={appId} onChange={e => setAppId(e.target.value)} placeholder="e.g., com.kiranaapps.app" className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-razorpay-accent/50 text-white placeholder:text-white/30 font-mono transition-all" />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase font-medium tracking-wide">User ID</label>
              <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="e.g., user_123" className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-razorpay-accent/50 text-white placeholder:text-white/30 font-mono transition-all" />
            </div>
          </div>
        </div>

        {/* Action Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-razorpay-accent"/> User Subscriptions</h3>
            <button onClick={handleFetchSubs} className="w-full bg-razorpay-light hover:bg-razorpay-accent text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all active:scale-95">
              Read Subs
            </button>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-razorpay-accent"/> Live Status</h3>
            <input value={statusId} onChange={e => setStatusId(e.target.value)} placeholder="sub_123..." className="w-full mb-3 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:ring-2 focus:ring-razorpay-accent/50" />
            <button onClick={handleCheckStatus} className="w-full bg-razorpay-light hover:bg-razorpay-accent text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all active:scale-95">
              Check Status
            </button>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2"><Search className="w-4 h-4 text-razorpay-accent"/> User Orders</h3>
            <input type="number" value={orderLimit} onChange={e => setOrderLimit(e.target.value)} placeholder="Limit: 50" className="w-full mb-3 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:ring-2 focus:ring-razorpay-accent/50" />
            <button onClick={handleGetOrders} className="w-full bg-razorpay-light hover:bg-razorpay-accent text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all active:scale-95">
              Fetch Orders
            </button>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2"><RefreshCcw className="w-4 h-4 text-razorpay-accent"/> Sync Status</h3>
            <input value={syncId} onChange={e => setSyncId(e.target.value)} placeholder="Internal Sub ID" className="w-full mb-3 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:ring-2 focus:ring-razorpay-accent/50" />
            <button onClick={handleSyncSub} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all active:scale-95">
              Force Sync
            </button>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500"/> Cancel Sub</h3>
            <input value={cancelId} onChange={e => setCancelId(e.target.value)} placeholder="Internal Sub ID" className="w-full mb-3 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:ring-2 focus:ring-red-500/50" />
            <button onClick={handleCancelSub} className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all active:scale-95">
              Cancel Subscription
            </button>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2"><List className="w-4 h-4 text-razorpay-accent"/> List Plans</h3>
            <p className="text-white/40 text-xs mb-3">Sync all razorpay plans linked to App.</p>
            <button onClick={handleFetchPlans} className="w-full bg-razorpay-light hover:bg-razorpay-accent text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all active:scale-95">
              Read Plans
            </button>
          </div>

        </div>

        {/* Results Block */}
        <div className="glass-panel rounded-xl p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">Operation Results</h3>
            <button onClick={clearResults} className="text-xs text-white/40 hover:text-white/70">Clear</button>
          </div>
          <div className="bg-black/60 rounded-lg border border-white/10 p-4 min-h-[300px] overflow-auto">
            {results.length === 0 ? (
              <span className="text-white/30 text-sm">Results will appear here...</span>
            ) : (
              <div className="space-y-4">
                {results.map((res) => (
                  <SyntaxHighlight key={res.id} data={res.content} isError={res.isError} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
