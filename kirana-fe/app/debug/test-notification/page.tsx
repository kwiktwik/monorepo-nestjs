"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/better-auth/client";

type NotificationMetadata = {
  amount?: number;
  [key: string]: unknown;
};

type NotificationResponse = {
  error?: string;
  message?: string;
  readNotification?: string;
  transactionType?: string;
  metadata?: NotificationMetadata;
  id?: string;
  notificationId?: string;
  success?: boolean;
};

type SessionUser = {
  id?: string;
  name?: string;
};

type SessionData = {
  user?: SessionUser;
};

export default function TestNotificationPage() {
  const [packageName, setPackageName] = useState("com.phonepe.app");
  const [amount, setAmount] = useState("100");
  const [sender, setSender] = useState("Test User");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<NotificationResponse | null>(null);

  // User Targeting
  const [session, setSession] = useState<SessionData | null>(null);
  const [targetUserId, setTargetUserId] = useState("");
  const [useCustomId, setUseCustomId] = useState(false);

  // Editable Content State
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await authClient.getSession();
        setSession(data);

        // Priority: session user id
        if (data?.user?.id) {
          setTargetUserId(data.user.id);
        }
      } catch (e) {
        console.error("Failed to fetch session", e);
      }
    };

    fetchSession();
  }, []);

  // Auto-generate content when dependencies change
  useEffect(() => {
    let generatedContent = "";
    switch (packageName) {
      case "com.phonepe.app":
        generatedContent = `You have received ₹${amount} from ${sender}.`;
        break;
      case "com.google.android.apps.nbu.paisa.user":
        generatedContent = `You received ₹${amount} from ${sender}`;
        break;
      case "net.one97.paytm":
        generatedContent = `Received ₹${amount} from ${sender}`;
        break;
      default:
        generatedContent = `${sender} sent you ₹${amount}`;
    }
    setContent(generatedContent);
  }, [packageName, amount, sender]);

  const getTitle = () =>
    packageName.includes("paisa") ? "Google Pay" : "Money Received";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    const title = getTitle();
    const bigText = content; // Use mutable content
    const finalUserId =
      useCustomId && targetUserId ? targetUserId : session?.user?.id;

    if (!finalUserId) {
      setResponse({
        error: "User ID is required. Please log in or enter a Target ID.",
      });
      setLoading(false);
      return;
    }

    try {
      // Always: send to temp table for Android to pick up via its own polling
      const res = await fetch("/api/test/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          userId: finalUserId,
          payload: {
            packageName,
            title,
            content,
            bigText,
            timestamp: new Date().toISOString(),
          },
        }),
      });
      const data = await res.json();
      setResponse({
        success: true,
        message:
          "Queued in temp notification table. The Android app will poll this entry.",
        id: data.id,
      });
    } catch (err) {
      console.error(err);
      setResponse({ error: "Failed to send request" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              🔔 Notification Tester
            </h1>
            <p className="text-primary-foreground/90 text-sm">
              Write test notification into temp table for Android polling
            </p>
          </div>
        </div>

        {/* User Session Banner */}
        {session?.user ? (
          <div className="bg-primary/5 border-b border-primary/10 px-6 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                Logged In As
              </p>
              <p className="text-sm font-medium text-gray-900">
                {session.user.name}
              </p>
            </div>
            <button
              onClick={() => setUseCustomId(!useCustomId)}
              className="text-xs text-primary hover:text-primary/80 underline"
            >
              {useCustomId ? "Use My ID" : "Override User ID"}
            </button>
          </div>
        ) : (
          <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-3">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <span>⚠️</span> Not logged in. Notifications may fail.
            </p>
          </div>
        )}

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Target User ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target User ID{" "}
                {useCustomId ? (
                  <span className="text-amber-600 text-xs">(Custom)</span>
                ) : (
                  <span className="text-gray-400 text-xs">(Auto-filled)</span>
                )}
              </label>
              <input
                type="text"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all font-mono text-xs bg-white border-amber-300"
                placeholder="user_..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App Package
              </label>
              <select
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              >
                <option value="com.phonepe.app">
                  PhonePe (com.phonepe.app)
                </option>
                <option value="com.google.android.apps.nbu.paisa.user">
                  Google Pay (com.google...)
                </option>
                <option value="net.one97.paytm">Paytm (net.one97.paytm)</option>
                <option value="com.whatsapp">WhatsApp (com.whatsapp)</option>
                <option value="com.android.shell">ADB Shell (Test)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender Name
                </label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Content (Editable)
              </span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary outline-none transition-all font-mono text-sm h-24"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-semibold shadow-md transition-all transform active:scale-95 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "📢 Queue Notification"
              )}
            </button>
          </form>

          {response && (
            <div className="mt-8 animate-fade-in">
              <div
                className={`p-4 rounded-lg border ${response.error ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-lg ${response.error ? "text-red-600" : "text-green-600"}`}
                  >
                    {response.error ? "❌ Error" : "✅ Success"}
                  </span>
                </div>

                {!response.error && (
                  <div className="space-y-2">
                    {response.message ? (
                      <p className="font-bold text-green-900 text-lg">
                        {response.message}
                      </p>
                    ) : (
                      <>
                        <div className="flex justify-between items-center border-b border-green-200 pb-2">
                          <span className="text-sm text-green-800">
                            TTS Read String:
                          </span>
                        </div>
                        <p className="font-bold text-green-900 text-lg">
                          &quot;{response.readNotification}&quot;
                        </p>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      {response.transactionType && (
                        <div>
                          <span className="block text-gray-500 text-xs">
                            Transaction Type
                          </span>
                          <span className="font-semibold text-gray-800">
                            {response.transactionType}
                          </span>
                        </div>
                      )}

                      {response.metadata?.amount && (
                        <div>
                          <span className="block text-gray-500 text-xs">
                            Amount
                          </span>
                          <span className="font-semibold text-gray-800">
                            ₹{response.metadata?.amount}
                          </span>
                        </div>
                      )}

                      {response.id && (
                        <div className="col-span-2">
                          <span className="block text-gray-500 text-xs">
                            ID
                          </span>
                          <span className="font-mono text-xs bg-white px-1 border rounded">
                            {response.id || response.notificationId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {response.error && (
                  <p className="text-red-700">{response.error}</p>
                )}
              </div>

              <div className="mt-4">
                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer hover:text-gray-700 mb-2">
                    View Raw Response
                  </summary>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
