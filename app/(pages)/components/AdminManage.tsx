"use client";

import React, { useState, useEffect } from "react";
import { Shield, Building, Users, RefreshCw, Save, Lock,X,Check, Edit3, Trash2, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Language } from "../text";

interface AdminManageProps {
  lang: Language;
  userRole: string | null; // Checked identity validation parameter fed from page.tsx
}

export default function AdminManage({ lang, userRole }: AdminManageProps) {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyDomain, setNewCompanyDomain] = useState("");
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editCompanyDomain, setEditCompanyDomain] = useState("");

  const [deleteTargetId,   setDeleteTargetId]   = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>("");
  
  const [deleteUserTargetId,   setDeleteUserTargetId]   = useState<string | null>(null);
  const [deleteUserTargetName, setDeleteUserTargetName] = useState<string>("");


  const syncSystemHierarchy = async () => {
    // -------------------------------------------------------------------------
    // API DISPATCH GUARD: Lock background execution loop if role is not admin
    // -------------------------------------------------------------------------
    if (userRole !== "admin") {
      setFeedback("Access Denied: Insufficient authorization permissions.");
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const response = await apiClient.get("/admin/hierarchy");
      setCompanies(response.data.companies || []);
      setUsers(response.data.users || []);
    } catch (err: any) {
      setFeedback(err.response?.data?.error || "Failed to synchronize system metadata.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (userRole === "admin") {
      syncSystemHierarchy(); 
    }
  }, [userRole]);

  // -------------------------------------------------------------------------
  // FRONTEND INTERFACE HARD GUARD SCREEN
  // -------------------------------------------------------------------------
  if (userRole !== "admin") 
 {
    return (
      <div className="w-full max-w-md mx-auto my-12 p-8 bg-card text-card-foreground border border-red-500/20 
                        rounded-xl shadow-xl text-center space-y-4 animate-in fade-in duration-200">
        <div className="inline-flex p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full">
          <Lock className="h-6 w-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            {lang === "en" ? "Administrative Clearance Required" : "ปฏิเสธการเข้าถึง: สำหรับแอดมินเท่านั้น"}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {lang === "en" 
              ? "Your active identity policy token does not hold sufficient permission vectors to inspect or mutate this directory root." 
              : "บัญชีของคุณไม่มีสิทธิ์ในการเข้าถึงหรือแก้ไขโครงสร้างระบบในส่วนนี้ กรุณาติดต่อผู้ดูแลระบบสูงสุด"}
          </p>
        </div>
      </div>
    );
  }

  const handleRegisterCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCompanyName) return;
    setLoading(true);
    try {
      // FIXED ROUTING: Hits the new dedicated company endpoint directly
      await apiClient.post("/admin/company", { 
        name: newCompanyName, 
        domain: newCompanyDomain.trim() || null 
      });
      setFeedback(lang === "en" ? `Corporate node "${newCompanyName}" deployed successfully.` : `เพิ่มหน่วยงานองค์กรใหม่ "${newCompanyName}" เรียบร้อยแล้ว`);
      setNewCompanyName(""); setNewCompanyDomain("");
      await syncSystemHierarchy();
    } catch (err: any) { 
      setFeedback(err.response?.data?.error || err.message); 
    } finally {
      setLoading(false);
    }
  };

   const handleUpdateCompany = async (id: string) => {
    if (!editCompanyName.trim()) return;
    setLoading(true);
    try {
      await apiClient.put(`/admin/company?id=${id}`, {
        name: editCompanyName,
        domain: editCompanyDomain.trim() || null
      });
      setFeedback(lang === "en" ? "Corporate parameter metrics updated cleanly." : "อัปเดตข้อมูลหน่วยงานสำเร็จแล้ว");
      setEditingCompanyId(null);
      await syncSystemHierarchy();
    } catch (err: any) {
      setFeedback(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Intercept deletion stream to trigger custom confirmation modal state instead of native browser popups
  const triggerDeleteAlert = (id: string, name: string) => {
    if (userRole !== "admin") return;
    setDeleteTargetId(id);
    setDeleteTargetName(name);
  };
 
  const confirmAndExecuteDelete = async () => {
    if (deleteTargetId) {
      await handlePurgeCompany(deleteTargetId ,deleteTargetName);
      // Reset confirmation states cleanly
      setDeleteTargetId(null);
      setDeleteTargetName("");
    }
  };

  const handlePurgeCompany = async (id: string, name: string) => {
    const confirmationText = lang === "en" 
      ? `Wipe corporate tenant "${name}" permanently? This cascades down to remove matching user policies.` 
      : `คุณต้องการลบหน่วยงาน "${name}" แบบถาวรหรือไม่? การดำเนินการนี้จะลบข้อมูลนโยบายสิทธิ์ของผู้ใช้ทั้งหมดที่เกี่ยวข้อง`;
    
    // if (!window.confirm(confirmationText)) return;
    if (!deleteTargetId || userRole !== "admin") return;
    setLoading(true);

    try {
      await apiClient.delete(`/admin/company?id=${id}`);
      setFeedback(lang === "en" ? `Tenant node "${name}" wiped out.` : `ลบข้อมูลหน่วยงาน "${name}" สำเร็จแล้ว`);
      setDeleteTargetId(null);
      setDeleteTargetName("");
      await syncSystemHierarchy();
    } catch (err: any) { 
      setFeedback(err.response?.data?.error || err.message); 
    } finally {
      setLoading(false);
    }
  };

   const triggerDeleteUserAlert = (id: string, name: string) => {
    if (userRole !== "admin") return;
    setDeleteUserTargetId(id);
    setDeleteUserTargetName(name);
  };

  const confirmAndExecuteDeleteUser = async () => {
    if (deleteUserTargetId) {
      await executePurgeUser(deleteUserTargetId ,deleteUserTargetName);
      // Reset confirmation states cleanly
      setDeleteUserTargetId(null);
      setDeleteUserTargetName("");
    }
  };

  //  Delete real-time user  
  const executePurgeUser = async (id: string, name: string) => {
    if (!deleteUserTargetId || userRole !== "admin") return;
    setLoading(true);
    try {
      await apiClient.delete(`/admin/user?id=${deleteUserTargetId}`);
      setFeedback(lang === "en" ? `Operator account "${deleteUserTargetName}" wiped out.` : `ลบบัญชีผู้ใช้ "${deleteUserTargetName}" ออกจากระบบสำเร็จแล้ว`);
      setDeleteUserTargetId(null); setDeleteUserTargetName("");
      await syncSystemHierarchy();
    } catch (err: any) {
      setFeedback(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Change Company
  const executeTenantSwap = async (userId: string, targetCompanyId: string) => {
    if (!targetCompanyId) return;
    setLoading(true);
    try {
      await apiClient.post("/admin/override", { action: "reassign_user", userId, targetCompanyId });
      setFeedback(lang === "en" ? "User workspace reallocated inside policy configuration." : "ย้ายสังกัดนโยบายองค์กรสำเร็จแล้ว");
      await syncSystemHierarchy();
    } catch (err: any) { setFeedback(err.response?.data?.error || err.message); } finally { setLoading(false); }
  };

    //  Change Role user  
  const executeRoleChange = async (userId: string, targetRole: string) => {
    if (!targetRole) return;

    setLoading(true);
    try {
      await apiClient.post("/admin/override", { action: "update_role", userId, targetRole });
      setFeedback(lang === "en" ? "User access permissions modified successfully." : "อัปเดตสิทธิ์การเข้าถึงสำเร็จแล้ว");
      await syncSystemHierarchy();
    } catch (err: any) { setFeedback(err.response?.data?.error || err.message); } finally { setLoading(false); }
  };

  

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-200">
      
          
      {/* =========================================================================
         1. CUSTOM OVERLAY DELETION MODAL DIALOG
         ========================================================================= */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-card text-card-foreground border border-border rounded-xl shadow-2xl p-6 relative space-y-4 animate-in scale-in duration-150">
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  {lang === "en" ? "Confirm Destructive Action" : "ยืนยันการลบหน่วยงานถาวร"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "en" 
                    ? "Wipe corporate tenant permanently? This cascades down to remove all matching user policies and workspace variables." 
                    : "คุณต้องการลบข้อมูลหน่วยงานนี้แบบถาวรหรือไม่? การลบจะทำลายสิทธิ์การเข้าถึงและนโยบายผู้ใช้ที่เกี่ยวข้องทั้งหมด"}
                </p>
              </div>
              <button 
                onClick={() => setDeleteTargetId(null)} 
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 
                rounded-md hover:bg-secondary transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-muted px-3 py-2.5 rounded-lg border font-mono text-xs text-foreground/90 truncate">
              <span className="font-bold text-primary mr-1">Target Company:</span> {deleteTargetName}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}  disabled={loading}
                className="px-4 py-2 text-xs font-bold bg-secondary text-secondary-foreground border 
                rounded-md hover:bg-muted transition-colors cursor-pointer"             
              >
                {lang === "en" ? "Cancel" : "ยกเลิก"}
              </button>
              <button
                onClick={confirmAndExecuteDelete}  disabled={loading}
                className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-md hover:bg-red-500 
                transition-colors shadow-sm cursor-pointer disabled:opacity-50" 
              >
                {loading ? (lang === "en" ? "Purging..." : "กำลังลบ...") : (lang === "en" ? "Delete Permanently" : "ยืนยันการลบถาวร")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         NEW MODAL LAYER B: CUSTOM OPERATOR USER DELETION DIALOG
         ========================================================================= */}
      {deleteUserTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-card text-card-foreground border border-border rounded-xl shadow-2xl p-6 relative space-y-4 animate-in scale-in duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold tracking-tight text-foreground">{lang === "en" ? "Purge User Profile" : "ยืนยันการลบบัญชีผู้ใช้งาน"}</h3>
                <p className="text-2xs text-muted-foreground leading-relaxed">
                  {lang === "en" ? 
                    "Are you sure you want to remove this operator? Cascading deletes will clear out their tokens, sessions, and testing route logs entirely."
                   : "คุณต้องการลบผู้ดูแลระบบรายนี้หรือไม่? ระบบจะทำลายโทเค็น เซสชันการทำงาน และประวัติการทดสอบ API ทั้งหมดถาวร"}
                </p>
              </div>
              <button onClick={() => setDeleteUserTargetId(null)} 
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-muted px-3 py-2.5 rounded-lg border font-mono text-2xs text-foreground/90 truncate">
              <span className="font-bold text-red-500 mr-1">Target Account:</span> {deleteUserTargetName}</div>
              <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setDeleteUserTargetId(null)} 
                    className="px-4 py-2 text-xs font-bold bg-secondary text-secondary-foreground border rounded-md hover:bg-muted transition-colors cursor-pointer" 
                    disabled={loading}>{lang === "en" ? "Cancel" : "ยกเลิก"}</button>
                  <button onClick={confirmAndExecuteDeleteUser} 
                    className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors shadow-sm cursor-pointer" 
                    disabled={loading}>{loading ? "Wiping..." : (lang === "en" ? "Wipe Profile" : "ยืนยันการลบผู้ใช้")}
                  </button>
              </div>
            </div>
        </div>
      )}


      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Shield className="h-7 w-7 text-red-500 animate-pulse" />
            <span>Root Matrix Commander System</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Universal Multi-Tenant Overwrite Workspace — Admin Eyes Only</p>
        </div>
        <button onClick={syncSystemHierarchy} className="p-2 bg-secondary rounded-md text-xs font-bold flex items-center gap-1 hover:bg-muted cursor-pointer text-foreground" disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{lang === "en" ? "Synchronize Parameters" : "ซิงโครไนซ์ข้อมูล"}</span>
        </button>
      </div>

      {feedback && <div className="p-3 bg-primary/10 border border-primary/20 text-xs font-mono rounded-lg text-primary">{feedback}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* CREATE COMPANY PROFILE PANEL */}
        <div className="bg-card text-card-foreground border p-5 rounded-xl space-y-4 shadow-sm">
          <h3 className="text-2sm font-bold tracking-wider text-primary uppercase flex items-center gap-2"><Building className="h-4 w-4" /> <span>{lang === "en" ? "Deploy Corporate Node" : "เพิ่มเครือข่ายองค์กร"}</span></h3>

          <form onSubmit={handleRegisterCompany} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[13px] font-bold text-muted-foreground">{lang === "en" ? "Company Name" : "ชื่อบริษัท/หน่วยงาน"}</label>
                <input type="text" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} placeholder="e.g. Enterprise Alpha" className="w-full text-2xs bg-background border rounded p-2 outline-none text-foreground focus:ring-1 focus:ring-primary" required disabled={loading} />
              </div>
              <div className="space-y-1">
                <label className="text-[13px] font-bold text-muted-foreground">{lang === "en" ? "Domain Pointer" : "โดเมนระบบ"}</label>
                <input type="text" value={newCompanyDomain} onChange={(e) => setNewCompanyDomain(e.target.value)} placeholder="alpha.io" className="w-full text-2xs bg-background border rounded p-2 outline-none text-foreground focus:ring-1 focus:ring-primary" disabled={loading} />
              </div>
            <button type="submit" className="w-full py-2 bg-primary text-primary-foreground font-bold text-2xs rounded hover:opacity-90 cursor-pointer flex items-center justify-center gap-1">
              <Save className="h-3.5 w-3.5" /> <span>Register Company Node</span>
            </button>
          </form>
        </div>

        {/* COMPANY RECONCILIATION DATA SHEET WITH  ACTIONS */}
       
          <div className="bg-card text-card-foreground border p-4 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-2xs font-bold text-muted-foreground tracking-wider uppercase px-1">
              {lang === "en" ? "Deployed Companies Directory" : "รายชื่อหน่วยงานในระบบ"}
            </h4>
            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
              {companies.map((c) => (
                <div key={c.id} className="p-3 bg-background border rounded-lg flex flex-col gap-2 shadow-xs transition-all">
                  
                  {editingCompanyId === c.id && userRole === "admin" ? (
                    /* INLINE INTERACTIVE INPUT RE-MAPPINGS FOR ADMIN */
                    <div className="space-y-2 animate-in fade-in duration-100">
                      <div className="space-y-1">
                        <input  className="w-full text-2xs bg-card border rounded p-1.5 outline-none font-bold text-foreground" 
                          type="text"  value={editCompanyName} required 
                          onChange={(e) => setEditCompanyName(e.target.value)}                                   
                        />
                        <input className="w-full text-[12px] bg-card border rounded p-1.5 outline-none font-mono text-muted-foreground" 
                          type="text" placeholder="domain.io" value={editCompanyDomain}      
                          onChange={(e) => setEditCompanyDomain(e.target.value)}                           
                        />
                      </div>
                      <div className="flex gap-1 justify-end">
                        <button className="p-1 px-2 bg-secondary text-secondary-foreground text-[12px] font-bold rounded 
                                          flex items-center gap-0.5 hover:bg-muted cursor-pointer"  
                          onClick={() => setEditingCompanyId(null)} 
                        >
                          <X className="h-3 w-3" /> Cancel
                        </button>
                        <button 
                          onClick={() => handleUpdateCompany(c.id)}     disabled={loading}
                          className="p-1 px-2 bg-primary text-primary-foreground text-[12px] font-bold rounded 
                                    flex items-center gap-0.5 hover:opacity-90 cursor-pointer"                       
                        >
                          <Check className="h-3 w-3" /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* STANDARD RECONCILIATION SUMMARY DATA DISPLAY ROW */
                    <div className="flex items-center justify-between text-2xs gap-4">
                      <div className="truncate font-medium text-foreground">
                        <p className="font-bold truncate">{c.name}</p>
                        {c.domain && <p className="text-[14px] text-muted-foreground font-mono mt-0.5">{c.domain}</p>}
                      </div>
                      
                      {/* Operational Inline Actions - Fully locked by userRole configuration checking */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => { 
                            setEditingCompanyId(c.id); 
                            setEditCompanyName(c.name); 
                            setEditCompanyDomain(c.domain || ""); 
                          }} 
                          className="p-1.5 hover:bg-muted text-muted-foreground hover:text-primary rounded transition-colors cursor-pointer" 
                          title="Edit Corporate Parameters" disabled={loading || userRole !== "admin"}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        {c.name !== "CompanyDemo" && (
                          <button  title="Purge Corporate Node"  disabled={loading || userRole !== "admin"}
                            onClick={() => triggerDeleteAlert(c.id, c.name)} 
                            className="p-1.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded transition-colors cursor-pointer"                         
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        


        {/* COMPREHENSIVE OPERATOR SECURITY MATRIX */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-2 px-1">
            <Users className="h-4 w-4" /> <span>Global User Profile & Access Mapping Company</span>
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {users.map((u) => (
              <div key={u.id} className="p-4 bg-card border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1 max-w-sm truncate">
                  <p className="text-sm font-bold text-foreground tracking-tight">{u.name || "Unnamed Operator"}</p>
                  <p className="text-sm font-mono text-muted-foreground truncate">{u.email}</p>
                                  
                   <div  className={` inline-flex items-center gap-1.5 mt-1 font-mono font-black px-2 py-0.5  text-[12px] uppercase
                          rounded  border  
                          ${
                          u.role==="admin" ?  " border-orange-500/20  bg-orange-500/10 text-orange-500 " :       
                          u.role === "superuser" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                            "bg-blue-500/10 text-White-500 border-blue-500/20"
                          }` } 
                    >        
                    Role: {u.role || "user"}
                   </div>

                </div>

                <div className="flex flex-wrap items-center gap-3 bg-background p-2 rounded-lg border">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-muted-foreground">Assign Tenant Group</span>
                    <select value={u.companyId || ""} 
                      onChange={(e) => executeTenantSwap(u.id, e.target.value)} 
                        className="text-xs bg-secondary rounded p-1 border-none focus:ring-1 focus:ring-primary outline-none text-foreground cursor-pointer">
                      <option value="" disabled>Choose target Company</option>
                      {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">       
                    <span className="text-[12px] font-bold text-muted-foreground">Modify Clear Threshold</span>
                    {u.role !== "admin" && 
                    (
                      <select value={u.role || "user"} 
                        onChange={(e) => executeRoleChange(u.id, e.target.value)} 
                        className="text-xs bg-secondary rounded p-1 border-none focus:ring-1 focus:ring-primary outline-none text-foreground cursor-pointer">
                        <option value="guest">Guest Profile</option>
                        <option value="user">Standard User</option>
                        <option value="superuser">Superuser Deck</option>
                        <option value="admin">System Admin</option>
                      </select>
                    )
                    }
                  </div>
                  
                  <div>
                    {u.role !== "admin" && 
                   (
                      <button  title="Purge Corporate Node"  disabled={loading || userRole !== "admin"}
                        onClick={() => triggerDeleteUserAlert(u.id, u.name)} 
                        className="p-1.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded transition-colors cursor-pointer"                         
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>

            ))}
          </div>
        
        </div>
      
      
      </div>


    </div>
  );
}
