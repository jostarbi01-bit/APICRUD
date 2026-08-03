"use client";

import React, { useState } from "react";
import { Play, CheckCircle, XCircle, Code, X, Copy, Check } from "lucide-react";
import { apiClient } from "@/lib/api";

interface ConsoleBoxProps {
  endpointId: string;
  method: string; // GET, POST, PUT, or DELETE
  path: string;
  onRefreshList: () => void;
}


export default function ConsoleBox({ endpointId, method, path, onRefreshList }: ConsoleBoxProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: number; text: string; success: boolean } | null>(null);
  
  const [payloadData, setPayloadData] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const executeLivePipelineTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    setPayloadData(null);
    try {
      // Maps front-end actions to the server-side proxy path using matching custom methods
      const response = await apiClient({
        method: method, // Dynamic invocation of matching method arrays (GET, POST, PUT, DELETE)
        url: `/endpoints/${endpointId}/test`,
        data: method !== "GET" ? { context: "Active UI Matrix Automation Request" } : undefined
      });

      setTestResult({
        status: response.data.proxyStatus || 200,
        text: response.data.proxyStatusText || "OK (External Call Resolved)",
        success: true
      });

      if (response.data.data) {
        setPayloadData(response.data.data);
      }
    } catch (err: any) {
      const errPayload = err.response?.data;
      setTestResult({
        status: errPayload?.status || err.response?.status || 500,
        text: errPayload?.details || errPayload?.error || err.message || "Proxy Transmission Failure",
        success: false
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!payloadData) return;
    navigator.clipboard.writeText(JSON.stringify(payloadData, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      
      {/* STATE-DRIVEN DYNAMIC JSON DATA TREE MODAL */}
      {isModalOpen && payloadData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[80vh] bg-card text-card-foreground border border-border rounded-xl shadow-xl flex flex-col relative">
            <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                <h3 className="text-2sm font-bold tracking-tight text-foreground">Payload Inspection Console Tree ({method})</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCopyToClipboard} className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold">
                  {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{isCopied ? "Copied" : "Copy JSON"}</span>
                </button>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex-grow p-5 overflow-auto font-mono text-2xs text-foreground bg-background rounded-b-xl max-h-[60vh]">
              <pre className="whitespace-pre-wrap selection:bg-primary/30 select-text leading-relaxed">{JSON.stringify(payloadData, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* STATUS AND TEST ACTION RUNTIME CONTROLS */}
      <div className="flex flex-wrap items-center gap-2 mt-1">
        {testResult && (
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[13px] font-mono border ${
            testResult.success ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
          }`}>
            {testResult.success ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            <span>Code {testResult.status}: {testResult.text}</span>
          </div>
        )}

        {payloadData && (
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border bg-secondary/80 text-secondary-foreground hover:bg-muted border-border cursor-pointer transition-colors">
            <Code className="h-3 w-3" /> <span>Inspect Response</span>
          </button>
        )}
      </div>

      <button 
        onClick={executeLivePipelineTest}
        disabled={isTesting}
        className="p-1 px-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer self-start"
      >
        <Play className={`h-3 w-3 fill-current ${isTesting ? "animate-pulse" : ""}`} />
        <span>{isTesting ? "Testing..." : `Test ${method}`}</span>
      </button>
    </div>
  );
}
