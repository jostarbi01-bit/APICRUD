"use client";

import React, { useState, useEffect } from "react";
import { Save, RotateCcw, Edit3, Trash2, RefreshCw, AlertTriangle,X } from "lucide-react";
import { useApiStore } from "@/store/useApiStore";
import { translations, Language } from "../text";
import ConsoleBox from "./ConsoleBox"; // Mount extracted component leaf node cleanly


export default function UserManage({ lang }: { lang: Language }) {
  const { endpoints, isLoading, error, fetchEndpoints, addEndpoint, updateEndpoint, deleteEndpoint } = useApiStore();
  const t = translations[lang];
 
  // Core Form Modification States
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formPath, setFormPath] = useState("");
  const [formMethod, setFormMethod] = useState("GET");
  const [formDesc, setFormDesc] = useState("");
 
  // Custom Dynamic Mock Payload State Tracking
  const [formMockBody, setFormMockBody] = useState("");
  const [jsonValidationError, setJsonValidationError] = useState<string | null>(null);

  // Alert Modal Tracking States
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>("");


  // Sync state data arrays out of PostgreSQL on mount
  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  // Real-time JSON validation linter hook loop
  useEffect(() => {
    if (!formMockBody.trim()) {
      setJsonValidationError(null);
      return;
    }
    try {
      JSON.parse(formMockBody);
      setJsonValidationError(null); // String evaluates cleanly to structural JSON object parameters
    } catch (err: any) {
      setJsonValidationError(err.message || "Invalid JSON syntax formatting.");
    }
  }, [formMockBody]);

  const resetForm = () => {
    setFormName("");
    setFormPath("");
    setFormMethod("GET");
    setFormDesc("");
    setFormMockBody("");
    setJsonValidationError(null);
    setIsEditing(null);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
      if (!formName || !formPath || jsonValidationError) return;

    const payloadData = {
      name: formName,
      path: formPath,
      method: formMethod,
      description: formDesc,
      mockBody: formMockBody.trim() || null
    };


    if (isEditing) {
      await updateEndpoint(isEditing, payloadData);
    } else {
      await addEndpoint(payloadData);
    }
    resetForm();

  };

  // Intercept action chain to register alert data profiles
  const triggerDeleteAlert = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
  };

  const confirmAndExecuteDelete = async () => {
    if (deleteTargetId) {
      await deleteEndpoint(deleteTargetId);
      // Reset confirmation states cleanly
      setDeleteTargetId(null);
      setDeleteTargetName("");
    }
  };

  
  return (
    <div className="space-y-8 max-w-6xl mx-auto">

        {/* -------------------------------------------------------------------------
         DOUBLY-GUARDED MODAL LAYER: DELETION CONFIRMATION DIALOG 
         ------------------------------------------------------------------------- */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-card text-card-foreground border border-border rounded-xl shadow-xl p-6 relative space-y-4 animate-in scale-in duration-200">
            
            {/* Header layout rows */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  {lang === "en" ? "Confirm Destructive Action" : "ยืนยันการลบข้อมูลระบบ"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "en" 
                    ? "Are you absolutely sure you want to delete this route parameter? This path variation cannot be recovered." 
                    : "คุณแน่ใจหรือไม่ว่าต้องการลบเอนด์พอยต์นี้? การดำเนินการนี้ไม่สามารถกู้คืนข้อมูลกลับมาได้"}
                </p>
              </div>
              <button 
                onClick={() => setDeleteTargetId(null)} 
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target row contextual data box */}
            <div className="bg-muted px-3 py-2.5 rounded-lg border font-mono text-xs text-foreground/90 truncate">
              <span className="font-bold text-primary mr-1">Target:</span> {deleteTargetName}
            </div>

            {/* Action trigger group */}
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 text-xs font-bold bg-secondary text-secondary-foreground border rounded-md hover:bg-muted transition-colors cursor-pointer"
              >
                {lang === "en" ? "Cancel" : "ยกเลิก"}
              </button>
              <button
                onClick={confirmAndExecuteDelete}
                className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors shadow-sm cursor-pointer"
              >
                {lang === "en" ? "Delete Permanently" : "ยืนยันการลบถาวร"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
         MAIN USER WORKSPACE INTERFACE LAYOUT BLOCK
         ------------------------------------------------------------------------- */
      }    
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">{t.usermanage}</h2>
          <p className="text-sm text-muted-foreground">Admin Workspace Endpoint Validation Workbench</p>
        </div>
        <button onClick={() => fetchEndpoints()} className="p-2 bg-secondary text-secondary-foreground rounded-md flex items-center gap-2 text-xs font-semibold hover:bg-muted" disabled={isLoading}>
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg">
          <span>Error Logged: {error}</span>
        </div>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <form onSubmit={handleCreateOrUpdate} className="bg-card text-card-foreground border p-5 rounded-xl space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{isEditing ? t.updateEndpoint : t.createEndpoint}</h3>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Endpoint Identification Label</label>
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Fetch Client Workspace Data" 
            className="w-full text-sm bg-background border rounded-md p-2 focus:ring-1 focus:ring-primary outline-none" required />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1 col-span-1">
              <label className="text-xs font-semibold text-muted-foreground">{t.method}</label>
              <select value={formMethod} onChange={(e) => setFormMethod(e.target.value)} 
              className="w-full text-sm bg-background border rounded-md p-2 outline-none">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">{t.path}</label>
              <input type="text" value={formPath} onChange={(e) => setFormPath(e.target.value)} placeholder="/v1/workspace" className="w-full text-sm bg-background border rounded-md p-2 focus:ring-1 focus:ring-primary outline-none" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">{t.description}</label>
            <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} className="w-full text-sm bg-background border rounded-md p-2 focus:ring-1 focus:ring-primary outline-none" />
          </div>

          {/* DYNAMIC JSON CUSTOM PAYLOAD EMULATOR FIELD SURFACE */}
            {["POST", "PUT", "PATCH"].includes(formMethod) && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted-foreground">Custom Mock JSON Body Payload</label>
                  {jsonValidationError && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.2 rounded">Bad JSON Syntax</span>
                  )}
                </div>
                <textarea 
                  value={formMockBody} rows={5} placeholder={`{\n  "status": "active",\n  "userId": 1024\n}`}
                  onChange={(e) => setFormMockBody(e.target.value)} 
                  className={`w-full text-xs font-mono bg-background border rounded-md p-2.5 focus:ring-1 outline-none text-foreground leading-relaxed
                    ${jsonValidationError ? "border-red-500/50 focus:ring-red-500" : "focus:ring-primary"  }` }
                />
                {jsonValidationError && (
                  <p className="text-[10px] font-mono text-red-500 leading-tight tracking-tight mt-0.5 max-w-full truncate">{jsonValidationError}</p>
                )}
              </div>
            )}

          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-primary text-primary-foreground text-xs font-bold py-2 px-3 rounded-md 
                    hover:opacity-90 flex items-center justify-center gap-1" disabled={isLoading || !!jsonValidationError} >
              <Save className="h-3.5 w-3.5" /> <span>{t.save}</span>
            </button>

            {isEditing && (
              <button type="button" onClick={resetForm} className="bg-secondary text-secondary-foreground text-xs 
                  font-bold py-2 px-3 rounded-md border hover:bg-muted flex items-center justify-center gap-1">
                <RotateCcw className="h-3.5 w-3.5" /> <span>{t.cancel}</span>
              </button>
            )}
          </div>


        </form>
        

        {/* Live Running Registry View Grid Row Sets */}
        <div className="lg:col-span-2 space-y-3">
          {endpoints.length === 0 && !isLoading ? (
            <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground text-sm">No live data records tracked inside the database pipeline.</div>
          ) : (
            endpoints.map((ep) => (
              <div key={ep.id} className="p-4 bg-card border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-primary/40 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    
                    <span className={`text-[14px] font-mono font-black px-2 py-0.5 rounded tracking-wide ${
                      ep.method === "GET" ? "bg-blue-500/10 text-blue-500" : 
                      ep.method === "POST" ? "bg-green-500/10 text-green-500" : 
                      ep.method === "PUT" ? "bg-red-500/10 text-yellow-500" :  "bg-red-500/10 text-red-500"  }`}>{ep.method}</span>
                    <span className="font-mono text-sm font-bold text-foreground">{ep.path}</span>
                  
                  </div>
                  <p className="text-xs font-bold text-foreground/80">{ep.name}</p>
                  {ep.description && <p className="text-xs text-muted-foreground">{ep.description}</p>}
                </div>

                {/* Operations Modification Elements */}
                <div className="flex items-center gap-1 bg-background p-1 rounded-md border">
                  <button className="p-1.5 hover:bg-muted rounded"  
                    onClick={() => { 
                      setIsEditing(ep.id); 
                      setFormName(ep.name); 
                      setFormPath(ep.path); 
                      setFormMethod(ep.method); 
                      setFormDesc(ep.description || ""); 
                      setFormMockBody(ep.mockBody || ""); }} 
                  >  
                  <Edit3 className="h-3.5 w-3.5" />        
                  </button>

                  <button  className="p-1.5 hover:bg-muted text-red-500 rounded" 
                    onClick={() => triggerDeleteAlert(ep.id, ep.name)}    >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                 
                {/* Mount the isolated tracking sub-component row frame */}
                  <ConsoleBox 
                    endpointId={ep.id} 
                    method={ep.method} 
                    path={ep.path} 
                    onRefreshList={fetchEndpoints} 
                  />
               
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}
