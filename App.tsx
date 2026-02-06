
import React, { useState, useCallback, useRef } from 'react';
import { MarScalperLayout } from './components/MarScalperLayout';
import { PlaybookRef } from './components/PlaybookRef';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { analyzeTradeScreenshot } from './services/geminiService';
import { TradeImage } from './types';

const App: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<TradeImage | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCurrentImage({
          id: Date.now().toString(),
          dataUrl,
          timestamp: Date.now()
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!currentImage) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeTradeScreenshot(currentImage.dataUrl);
      setCurrentImage(prev => prev ? { ...prev, analysis: result } : null);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("System Error: Coaching uplink disconnected. Verify connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setCurrentImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <MarScalperLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        {/* Left Side: Playbook Ref (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-3">
          <PlaybookRef />
        </div>

        {/* Center: Main Area */}
        <div className="lg:col-span-9 space-y-6">
          {!currentImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-[400px] border border-red-900/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-red-600/50 hover:bg-red-950/5 transition-all group bg-zinc-900/20"
            >
              <div className="w-16 h-16 rounded-full bg-red-950/30 flex items-center justify-center mb-6 border border-red-900/30 group-hover:scale-105 transition-transform">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-orbitron font-bold text-white mb-2 uppercase tracking-widest">Submit Execution Data</h2>
              <p className="text-gray-500 text-[11px] text-center max-w-xs px-4 uppercase tracking-tighter">
                Upload trade screenshot for objective evaluation. Only verified MarScalper setups will be processed.
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Image Preview & Controls */}
              <div className="relative group rounded-xl overflow-hidden border border-red-900/30 bg-black">
                <img 
                  src={currentImage.dataUrl} 
                  alt="Execution Preview" 
                  className={`w-full max-h-[450px] object-contain transition-all ${isAnalyzing ? 'blur-md opacity-50' : ''}`}
                />
                
                {isAnalyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-orbitron text-red-600 text-[10px] tracking-[0.4em] uppercase">Processing Parameters...</p>
                  </div>
                )}

                {!isAnalyzing && (
                  <div className="absolute top-4 right-4 flex space-x-2">
                    {!currentImage.analysis && (
                      <button 
                        onClick={startAnalysis}
                        className="px-8 py-2 bg-red-700 hover:bg-red-600 text-white font-orbitron font-bold rounded text-xs tracking-widest transition-all"
                      >
                        RUN EVALUATION
                      </button>
                    )}
                    <button 
                      onClick={reset}
                      className="p-2 bg-black/80 hover:bg-black text-white rounded transition-all border border-red-900/30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Analysis Results */}
              {currentImage.analysis && (
                <AnalysisDisplay analysis={currentImage.analysis} />
              )}
            </div>
          )}
          
          {/* Mobile Only: Playbook Ref (Bottom) */}
          <div className="lg:hidden mt-8 h-96">
            <PlaybookRef />
          </div>
        </div>
      </div>
    </MarScalperLayout>
  );
};

export default App;
