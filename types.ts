
export interface AnalysisResult {
  isSetupValid: boolean;
  verdict: string; // The clear, final verdict (e.g., "EXECUTION APPROVED" or "EXECUTION REJECTED")
  setupType: string;
  confluenceScore: number; // 1-10
  feedback: string;
  pillars: {
    strategy: string;
    risk: string;
    psychology: string;
  };
  checklist: {
    item: string;
    checked: boolean;
  }[];
}

export interface TradeImage {
  id: string;
  dataUrl: string;
  timestamp: number;
  analysis?: AnalysisResult;
}
