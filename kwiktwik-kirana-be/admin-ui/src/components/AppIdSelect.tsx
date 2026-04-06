import { useState } from 'react';

interface AppIdSelectProps {
  value: string;
  onChange: (value: string) => void;
  uniqueAppIds: string[];
  required?: boolean;
  allowNewApp?: boolean;
  placeholder?: string;
}

export function AppIdSelect({
  value,
  onChange,
  uniqueAppIds,
  required = false,
  allowNewApp = true,
  placeholder = 'e.g., com.kwiktwik.app',
}: AppIdSelectProps) {
  const [showNewAppInput, setShowNewAppInput] = useState(false);

  // If value is not in uniqueAppIds and not empty, show as custom
  const isCustomApp = value && !uniqueAppIds.includes(value);

  if (
    !allowNewApp ||
    (!showNewAppInput && !isCustomApp && uniqueAppIds.length > 0)
  ) {
    return (
      <div className="flex gap-2">
        <select
          value={value || ''}
          onChange={(e) => {
            if (e.target.value === '__new__') {
              setShowNewAppInput(true);
              onChange('');
            } else {
              onChange(e.target.value);
            }
          }}
          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          required={required}
        >
          <option value="" className="bg-gray-800">
            Select an app...
          </option>
          {uniqueAppIds.map((appId) => (
            <option key={appId} value={appId} className="bg-gray-800">
              {appId}
            </option>
          ))}
          {allowNewApp && (
            <option value="__new__" className="bg-gray-800">
              + Add New App ID
            </option>
          )}
        </select>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        required={required}
        autoFocus
      />
      {uniqueAppIds.length > 0 && (
        <button
          type="button"
          onClick={() => setShowNewAppInput(false)}
          className="px-3 py-2 rounded-lg bg-white/10 text-white/70 hover:text-white transition-all text-sm"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
