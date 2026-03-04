"use client";

import { useState } from "react";

export default function OverlayDebugPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Default values
  const [contentId, setContentId] = useState("6647948");
  const [imageUrl, setImageUrl] = useState(
    "https://img.freepik.com/premium-photo/man-with-beard-blue-shirt-is-standing-front-crowd_1187092-137326.jpg?w=2000"
  );

  /* Existing Modifiers Logic above */
  /* State */

  

  // Extended Config State
  const [config, setConfig] = useState({
    // Percentage fields
    imagePercentageFromStart: 30,
    imagePercentageFromTop: 59.41,
    imagePercentageWidth: 44.41,
    
    imageShape: "CIRCLE",
    shapeImageUrl: "https://cnd.storyowl.app/migrated/migration_160FiikO3zmH0Vg1p69ZK.png",
  });

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: name === "imageShape" ? value : parseFloat(value) || 0,
    }));
  };

  const generateOverlay = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Prepare payload
    const payloadConfig: any = { ...config };
    

    
    // Clean up any residual absolute fields if they existed
    delete payloadConfig.x;
    delete payloadConfig.y;
    delete payloadConfig.width;

    try {
      const response = await fetch("/api/video/overlay/by-content-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          imageUrl,
          ...payloadConfig,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate overlay");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [showRuler, setShowRuler] = useState(false);

  // ... (rest of state)

  // Calculate aspect ratio for container
  const aspectRatio =
    result?.videoWidth && result?.videoHeight
      ? (result.videoHeight / result.videoWidth) * 100
      : 150; // Default 2:3

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Overlay Positioning Debugger
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Configuration */}
          <div className="space-y-6">
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <h2 className="text-lg font-semibold mb-3 text-primary">
                Core Parameters
              </h2>
              <div className="space-y-3">
                {/* Inputs for ID and URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Content ID
                  </label>
                  <input
                    type="text"
                    value={contentId}
                    onChange={(e) => setContentId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shape Mask URL <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="shapeImageUrl"
                    value={config.shapeImageUrl || ""}
                    onChange={handleConfigChange}
                    placeholder="https://... (Leave empty for default shapes)"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">If provided, this mask's aspect ratio defines the overlay shape.</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100 space-y-6">
              <div className=" items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-green-800">
                  Position & Size
                </h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    X % (Start)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="imagePercentageFromStart"
                    value={config.imagePercentageFromStart}
                    onChange={handleConfigChange}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Y % (Top)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="imagePercentageFromTop"
                    value={config.imagePercentageFromTop}
                    onChange={handleConfigChange}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    Width %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="imagePercentageWidth"
                    value={config.imagePercentageWidth}
                    onChange={handleConfigChange}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm"
                  />
                </div>
              </div>


              </div>
            </div>
            
            <button
              onClick={generateOverlay}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg shadow-md transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 active:transform active:scale-95"
              }`}
            >
              {loading ? "Processing..." : "Generate Overlay"}
            </button>

            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>

          {/* Right Column: Result */}
          <div className="bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-start p-4 min-h-[500px]">
            {result?.videoUrl ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <div className="flex items-center space-x-4 mb-2">
                  <h3 className="text-lg font-semibold text-gray-700 text-center">
                    Result Video
                  </h3>
                  <div className="flex items-center bg-white rounded-lg p-1 border border-gray-300 shadow-sm">
                    <input 
                      type="checkbox" 
                      id="showRuler" 
                      checked={showRuler} 
                      onChange={(e) => setShowRuler(e.target.checked)}
                      className="mr-2 h-4 w-4 text-primary"
                    />
                    <label htmlFor="showRuler" className="text-xs font-bold text-gray-700 cursor-pointer select-none">Show Ruler</label>
                  </div>
                </div>
                
                {/* Video Container - Dynamic Aspect Ratio */}
                <div 
                  className="relative w-full bg-black rounded-lg overflow-hidden shadow-xl"
                  style={{ paddingTop: `${aspectRatio}%` }}
                >
                    <video
                      src={result.videoUrl}
                      controls
                      autoPlay
                      loop
                      className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                    {showRuler && (
                      <RulerOverlay 
                        width={result.videoWidth || 100} 
                        height={result.videoHeight || 100} 
                      />
                    )}
                </div>
                <div className="text-xs text-center text-gray-500 break-all">
                    {result.videoUrl}
                </div>
                {result.videoWidth && result.videoHeight && (
                  <div className="text-xs text-center text-gray-500 font-mono mt-1">
                    Dimensions: {result.videoWidth}x{result.videoHeight}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 my-auto">
                <p className="mb-2 text-xl">🎬</p>
                <p>No video generated yet.</p>
                <p className="text-sm">Click "Generate" to start.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component for Ruler/Grid
function RulerOverlay({ width, height }: { width: number; height: number }) {
  // Generate grid percentages
  const steps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Semi-transparent overlay to make grid visible */}
      
      {/* SVG Grid */}
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
          </pattern>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#smallGrid)"/>
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
          </pattern>
        </defs>

        {/* 10% Grid Lines */}
        {steps.map(step => (
           <g key={step}>
             {/* Vertical Lines */}
             <line 
                x1={`${step}%`} y1="0" 
                x2={`${step}%`} y2="100%" 
                stroke="rgba(0, 255, 255, 0.4)" 
                strokeWidth={step === 50 ? 2 : 1}
                strokeDasharray={step === 50 ? "none" : "4 2"}
             />
             {/* Horizontal Lines */}
             <line 
                x1="0" y1={`${step}%`} 
                x2="100%" y2={`${step}%`} 
                stroke="rgba(0, 255, 255, 0.4)" 
                strokeWidth={step === 50 ? 2 : 1}
                strokeDasharray={step === 50 ? "none" : "4 2"}
             />
             
             {/* Labels (avoid edges) */}
             {step > 0 && step < 100 && (
               <>
                 <text x={`${step}%`} y="15" fill="rgba(0, 255, 255, 0.8)" fontSize="10" textAnchor="middle">{step}%</text>
                 <text x="5" y={`${step}%`} fill="rgba(0, 255, 255, 0.8)" fontSize="10" dominantBaseline="middle">{step}%</text>
               </>
             )}
           </g>
        ))}

        {/* Center Crosshair */}
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255, 0, 0, 0.5)" strokeWidth="2" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255, 0, 0, 0.5)" strokeWidth="2" />
      </svg>
      
      {/* Pixel Dimensions Label on corners if available */}
      <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded">
        {width}x{height}
      </div>
    </div>
  );
}
