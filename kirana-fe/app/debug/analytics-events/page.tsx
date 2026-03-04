"use client";

import { useState, useMemo } from "react";
import { 
  ANDROID_ANALYTICS_EVENTS, 
  KTIKTWIK_KIT_EVENTS, 
  ALERTPAY_EVENTS,
  AndroidAnalyticsEvent 
} from "@/lib/events/android-analytics-events";

type FilterType = "all" | "kwiktwik-kit" | "alertpay" | "jamun";
type EventType = "all" | "facebook" | "custom";

export default function AnalyticsDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<FilterType>("all");
  const [typeFilter, setTypeFilter] = useState<EventType>("all");
  const [showJson, setShowJson] = useState(false);

  const jamunEvents = useMemo(() => 
    ANDROID_ANALYTICS_EVENTS.filter(e => e.source === 'jamun')
  , []);

  const fbEvents = useMemo(() => 
    ANDROID_ANALYTICS_EVENTS.filter(e => e.type === 'facebook')
  , []);

  const customEvents = useMemo(() => 
    ANDROID_ANALYTICS_EVENTS.filter(e => e.type === 'custom')
  , []);

  const filteredEvents = useMemo(() => {
    return ANDROID_ANALYTICS_EVENTS.filter((event) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.purpose?.toLowerCase().includes(searchQuery.toLowerCase());

      // Source filter
      const matchesSource = sourceFilter === "all" || event.source === sourceFilter;

      // Type filter
      const matchesType = typeFilter === "all" || event.type === typeFilter;

      return matchesSearch && matchesSource && matchesType;
    });
  }, [searchQuery, sourceFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: ANDROID_ANALYTICS_EVENTS.length,
    kwiktwikKit: KTIKTWIK_KIT_EVENTS.length,
    alertpay: ALERTPAY_EVENTS.length,
    jamun: jamunEvents.length,
    facebook: fbEvents.length,
    custom: customEvents.length,
  }), [fbEvents, customEvents, jamunEvents]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Android Analytics Events
          </h1>
          <p className="text-gray-600">
            Centralized view of all analytics events from Android apps (kwiktwik-kit + alertpay)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <StatCard 
            title="Total Events" 
            value={stats.total} 
            color="blue"
          />
          <StatCard 
            title="kwiktwik-kit" 
            value={stats.kwiktwikKit} 
            color="purple"
          />
          <StatCard 
            title="alertpay" 
            value={stats.alertpay} 
            color="green"
          />
          <StatCard 
            title="jamun" 
            value={stats.jamun} 
            color="teal"
          />
          <StatCard 
            title="Facebook" 
            value={stats.facebook} 
            color="indigo"
          />
          <StatCard 
            title="Custom" 
            value={stats.custom} 
            color="orange"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search events by name, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as FilterType)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sources</option>
              <option value="kwiktwik-kit">kwiktwik-kit</option>
              <option value="alertpay">alertpay</option>
              <option value="jamun">jamun</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as EventType)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="facebook">Facebook</option>
              <option value="custom">Custom</option>
            </select>

            {/* Toggle JSON View */}
            <button
              onClick={() => setShowJson(!showJson)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showJson 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {showJson ? "Show Table" : "Show JSON"}
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredEvents.length} of {ANDROID_ANALYTICS_EVENTS.length} events
        </div>

        {/* Events Display */}
        {showJson ? (
          <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium">JSON Output</h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(ANDROID_ANALYTICS_EVENTS, null, 2))}
                className="text-gray-400 hover:text-white text-sm"
              >
                Copy JSON
              </button>
            </div>
            <pre className="text-green-400 text-sm font-mono overflow-x-auto">
              {JSON.stringify(filteredEvents, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {event.name}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {event.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {event.purpose || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.source === 'kwiktwik-kit' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {event.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.type === 'facebook' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => copyToClipboard(event.name)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-gray-500 text-sm gap-4">
          <p>
            Events are auto-generated from Android source code. 
            Run <code className="bg-gray-100 px-1 rounded">node scripts/extract-android-events.js</code> to update.
          </p>
          <a 
            href="/docs/ANALYTICS_EVENTS.md" 
            target="_blank"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            View Full Documentation →
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  color 
}: { 
  title: string; 
  value: number; 
  color: "blue" | "purple" | "green" | "indigo" | "orange" | "teal";
}) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    green: "bg-green-50 border-green-200 text-green-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    teal: "bg-teal-50 border-teal-200 text-teal-700",
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{title}</div>
    </div>
  );
}
