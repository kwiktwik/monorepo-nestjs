import { useState } from 'react';
import { useAdminApi } from '../hooks/useAdminApi';
import { SyntaxHighlight } from '../components/SyntaxHighlight';
import { ShieldCheck, Search, RefreshCw, Send } from 'lucide-react';

export default function PhonePe() {
  const { fetchApi } = useAdminApi();
  const [appId, setAppId] = useState('');
  const [userId, setUserId] = useState('');
  
  const [statusSubId, setStatusSubId] = useState('');
  const [orderSubId, setOrderSubId] = useState('');
  const [orderId, setOrderId] = useState('');
  
  const [notifySubId, setNotifySubId] = useState('');
  const [notifyAmount, setNotifyAmount] = useState('');
  const [notifyMetadata, setNotifyMetadata] = useState('');

  const [results, setResults] = useState<{ id: string; content: any; isError: boolean }[]>([]);

  const addResult = (content: any, isError = false) => {
    setResults(prev => [...prev, { id: Math.random().toString(), content, isError }]);
  };

  const clearResults = () => setResults([]);

  // Fetch subscriptions
  const handleFetchSubs = async () => {
    if (!appId || !userId) return addResult({ error: 'App ID and User ID required' }, true);
    try {
      addResult({ loading: 'Fetching subscriptions...' });
      const data = await fetchApi(`/api/admin/phonepe/subscriptions?userId=${userId}&appId=${appId}`);
      addResult(data);
    } catch (err: any) {
      addResult({ error: err.message }, true);
    }
  };

  // Status check
  const handleCheckStatus = async () => {
    if (!appId || !statusSubId) return addResult({ error: 'App ID and Merchant sub ID required' }, true);
    try {
      addResult({ loading: 'Fetching subscription status...' });
      const data = await fetchApi(`/api/admin/phonepe/subscriptions/${statusSubId}/status?appId=${appId}`);
      addResult(data);
    } catch (err: any) {
      addResult({ error: err.message }, true);
    }
  };

  const handleSyncStatus = async () => {
    if (!appId || !orderSubId || !orderId) return addResult({ error: 'App ID, Sub ID, and Order ID required' }, true);
    try {
      addResult({ loading: 'Syncing subscription status...' });
      const data = await fetchApi(`/api/admin/phonepe/subscriptions/${orderSubId}/sync?appId=${appId}&merchantOrderId=${orderId}`, { method: 'POST' });
      addResult(data);
    } catch (err: any) {
      addResult({ error: err.message }, true);
    }
  };

  const handleNotify = async () => {
    if (!appId || !userId || !notifySubId || !notifyAmount) return addResult({ error: 'Missing required notify fields' }, true);
    let metadata = {};
    if (notifyMetadata) {
      try { metadata = JSON.parse(notifyMetadata); } catch(e) { return addResult({ error: 'Invalid metadata JSON' }, true); }
    }
    
    try {
      addResult({ loading: 'Triggering redemption notification...' });
      const data = await fetchApi(`/api/admin/phonepe/subscriptions/${notifySubId}/notify-redemption?appId=${appId}&userId=${userId}`, {
        method: 'POST',
        body: JSON.stringify({ amount: parseFloat(notifyAmount), metadata })
      });
      addResult(data);
    } catch (err: any) {
      addResult({ error: err.message }, true);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto bg-black/20">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title inside Content Area instead of fixed top */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white/90">PhonePe Operations</h2>
          <p className="text-white/50 text-sm">Manage payment & subscription states via PhonePe integration</p>
        </div>

        {/* Common Params */}
        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Common Credentials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase font-medium tracking-wide">App ID</label>
              <input value={appId} onChange={e => setAppId(e.target.value)} placeholder="e.g., kwiktwik" className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-phonepe/50 text-white placeholder:text-white/30 font-mono transition-all" />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1.5 uppercase font-medium tracking-wide">User ID</label>
              <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="e.g., user_123" className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-phonepe/50 text-white placeholder:text-white/30 font-mono transition-all" />
            </div>
          </div>
        </div>

        {/* Action Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2"><Search className="w-5 h-5 text-phonepe-light"/> Get User Subscriptions</h3>
            <button onClick={handleFetchSubs} className="w-full bg-phonepe hover:bg-phonepe-light text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              Fetch Subscriptions
            </button>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-phonepe-light"/> Check Sub Status</h3>
            <div className="mb-4">
              <input value={statusSubId} onChange={e => setStatusSubId(e.target.value)} placeholder="Merchant Subscription ID" className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-white outline-none focus:ring-2 focus:ring-phonepe/50" />
            </div>
            <button onClick={handleCheckStatus} className="w-full bg-phonepe hover:bg-phonepe-light text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              Check Status
            </button>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2"><RefreshCw className="w-5 h-5 text-phonepe-light"/> Sync from Order</h3>
            <div className="space-y-3 mb-4">
              <input value={orderSubId} onChange={e => setOrderSubId(e.target.value)} placeholder="Merchant Subscription ID" className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-white outline-none focus:ring-2 focus:ring-phonepe/50" />
              <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="Merchant Order ID" className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-white outline-none focus:ring-2 focus:ring-phonepe/50" />
            </div>
            <button onClick={handleSyncStatus} className="w-full bg-phonepe hover:bg-phonepe-light text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              Sync Status
            </button>
          </div>

          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2"><Send className="w-5 h-5 text-phonepe-light"/> Notify Redemption</h3>
            <div className="space-y-3 mb-4">
              <input value={notifySubId} onChange={e => setNotifySubId(e.target.value)} placeholder="Merchant Subscription ID" className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-white outline-none focus:ring-2 focus:ring-phonepe/50" />
              <div className="flex gap-3">
                <input type="number" value={notifyAmount} onChange={e => setNotifyAmount(e.target.value)} placeholder="Amount (INR)" className="w-1/2 bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-white outline-none focus:ring-2 focus:ring-phonepe/50" />
                <input value={notifyMetadata} onChange={e => setNotifyMetadata(e.target.value)} placeholder='{"note":"abc"}' className="w-1/2 bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-white outline-none focus:ring-2 focus:ring-phonepe/50" />
              </div>
            </div>
            <button onClick={handleNotify} className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              Trigger Charge
            </button>
          </div>

        </div>

        {/* Results Block */}
        <div className="glass-panel rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">Operation Results</h3>
            <button onClick={clearResults} className="text-xs text-white/40 hover:text-white/70">Clear</button>
          </div>
          <div className="bg-black/60 rounded-lg border border-white/10 p-4 min-h-[200px] overflow-auto">
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
