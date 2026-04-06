import { useState } from 'react';
import { Send, Smartphone, Hash, AlertCircle, Bell, FileJson, Key } from 'lucide-react';
import { useAdminApi } from '../hooks/useAdminApi';

export default function Notifications() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fcmToken, setFcmToken] = useState('');
  const [appId, setAppId] = useState('');
  const [payloadText, setPayloadText] = useState('{\n  "title": "Test Push",\n  "body": "This is a test notification."\n}');
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { fetchApi } = useAdminApi();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    if (!phoneNumber.trim() && !fcmToken.trim()) {
      setError('Please provide either a phone number or an FCM Token.');
      setIsLoading(false);
      return;
    }

    let parsedPayload;
    try {
      parsedPayload = payloadText.trim() ? JSON.parse(payloadText) : undefined;
    } catch (err) {
      setError('Invalid JSON in Payload field.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetchApi('/api/admin/notifications/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber || undefined,
          fcmToken: fcmToken || undefined,
          appId: appId || undefined,
          payload: parsedPayload,
        }),
      });

      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white/90 flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            Push Notifications
          </h2>
          <p className="text-white/50 mt-2 text-lg">
            Send test push notifications to users via Firebase Cloud Messaging.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="glass-panel p-6 border border-white/10 shadow-2xl rounded-2xl bg-black/40">
            <h3 className="text-xl font-semibold text-white/80 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-400" />
              Configure Payload
            </h3>

            <form onSubmit={handleSend} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 block flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-white/40" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-white/30 transition-all font-mono"
                  />
                </div>
                
                <div className="flex items-center gap-4 text-white/30 text-xs font-medium uppercase min-w-0">
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span>OR / AND</span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 block flex items-center gap-2">
                    <Key className="w-4 h-4 text-white/40" />
                    FCM Token (Direct Push)
                  </label>
                  <input
                    type="text"
                    value={fcmToken}
                    onChange={(e) => setFcmToken(e.target.value)}
                    placeholder="Enter device FCM token..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-white/30 transition-all font-mono"
                  />
                  <p className="text-xs text-white/40 mt-1">If provided, notification will route to this device directly.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 block flex items-center gap-2">
                  <Hash className="w-4 h-4 text-white/40" />
                  App ID (Target Package)
                </label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="e.g. com.paymentalert.app"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-white/30 transition-all font-mono"
                />
                <p className="text-xs text-white/40 mt-1">Leave empty to only create a DB record without sending FCM.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 block flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-white/40" />
                  FCM Data Payload (JSON)
                </label>
                <textarea
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  rows={6}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-white/30 transition-all font-mono resize-y"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Send className="w-5 h-5" /> Send Notification</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="glass-panel p-6 border border-white/10 shadow-2xl rounded-2xl bg-black/20 h-full">
              <h3 className="text-xl font-semibold text-white/80 mb-6 flex items-center gap-2">
                <TerminalSquare className="w-5 h-5 text-purple-400" />
                Response / Logs
              </h3>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-red-400 mb-4">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm">{error}</div>
                </div>
              )}

              {result ? (
                <div className="bg-black/60 rounded-xl p-4 overflow-x-auto border border-white/5">
                  <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              ) : (
                !error && (
                  <div className="h-full flex items-center justify-center text-white/30 text-sm italic font-mono pb-10">
                    Waiting for execution...
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ensure TerminalSquare is imported since it's used in the JSX above
import { TerminalSquare } from 'lucide-react';
