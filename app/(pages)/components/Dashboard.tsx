"use client";

import React, { useState, useEffect } from "react";
import { Users, Activity, ShieldCheck, Search, ArrowUpRight, Loader2, Building, Mail, Terminal } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Language } from "../text";

interface DashboardProps {
  lang: Language;
}

export default function Dashboard({ lang }: DashboardProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/admin/hierarchy");
      setUsers(response.data.users || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to retrieve system dashboard history matrices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const totalOperators = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const uniqueCompanies = Array.from(new Set(users.map((u) => u.companyName || "CompanyDemo"))).length;
  const totalEndpointsDeployed = users.reduce((sum, u) => sum + (u.endpointCount || 0), 0);

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-7 w-7 text-primary" />
            <span>{lang === "en" ? "Operator System Dashboard" : "แผงควบคุมระบบเจ้าหน้าที่"}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {lang === "en" ? "Real-time privilege allocation maps, tenant spaces, and total authored endpoint tallies." : "แผนผังการกำหนดสิทธิ์แยกตามสิทธิ์องค์กรและสถิติจำนวนเอนด์พอยต์ที่สร้างแยกตามรายบุคคล"}
          </p>
        </div>
        <button 
          onClick={fetchDashboardMetrics}
          disabled={loading}
          className="p-2 bg-secondary text-secondary-foreground rounded-md text-xs font-bold flex items-center gap-2 hover:bg-muted cursor-pointer transition-colors"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          <span>{lang === "en" ? "Refresh Logs" : "รีเฟรชประวัติ"}</span>
        </button>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg"><span>{error}</span></div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card text-card-foreground border rounded-xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">{lang === "en" ? "Total Operators" : "เจ้าหน้าที่ทั้งหมด"}</p>
            <p className="text-2xl font-black tracking-tight">{totalOperators}</p>
          </div>
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><Users className="h-5 w-5" /></div>
        </div>

        <div className="p-4 bg-card text-card-foreground border rounded-xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">{lang === "en" ? "Root Admins" : "ผู้ดูแลระบบสูงสุด"}</p>
            <p className="text-2xl font-black text-red-500 tracking-tight">{adminCount}</p>
          </div>
          <div className="p-2.5 bg-red-500/10 text-red-500 rounded-full"><ShieldCheck className="h-5 w-5" /></div>
        </div>

        <div className="p-4 bg-card text-card-foreground border rounded-xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">{lang === "en" ? "Global Mock Routes" : "เอนด์พอยต์ในระบบรวม"}</p>
            <p className="text-2xl font-black text-foreground tracking-tight">{totalEndpointsDeployed}</p>
          </div>
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl"><Terminal className="h-5 w-5" /></div>
        </div>

        <div className="p-4 bg-card text-card-foreground border rounded-xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">{lang === "en" ? "Active Tenants" : "องค์กรที่มีการใช้งาน"}</p>
            <p className="text-2xl font-black tracking-tight">{uniqueCompanies}</p>
          </div>
          <div className="p-2.5 bg-green-500/10 text-green-500 rounded-xl"><Building className="h-5 w-5" /></div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={lang === "en" ? "Filter by name, email, role, or company..." : "กรองตามชื่อ, อีเมล, สิทธิ์ หรือองค์กร..."}
          className="w-full text-xs bg-card border rounded-lg py-2.5 pl-10 pr-4 outline-none focus:ring-1 focus:ring-primary text-foreground transition-all"
        />
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b bg-muted/20">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            {lang === "en" ? "System Operator Operational Status List" : "ทำเนียบสถานะและสิทธิ์การทำงานของเจ้าหน้าที่"}
          </h3>
        </div>
        
        <div className="divide-y divide-border/60">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground">
              {lang === "en" ? "No matching auditing indices found." : "ไม่พบข้อมูลประวัติเจ้าหน้าที่ตามคำค้นหา"}
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full shrink-0 font-bold text-xs flex items-center justify-center ${u.role === "admin" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"}`}>
                    {u.name ? u.name.substring(0, 2).toUpperCase() : "OP"}
                  </div>
                  <div className="space-y-0.5 truncate max-w-xs sm:max-w-md">
                    <p className="text-sm font-bold text-foreground leading-tight">{u.name || "Unnamed Operator"}</p>
                    <p className="text-xs font-mono text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3 shrink-0" /><span>{u.email}</span></p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <div className="flex items-center gap-1 bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20 font-mono text-[12px] text-primary">
                    <Terminal className="h-3 w-3 shrink-0" />
                    <span className="font-bold">{u.endpointCount || 0} {lang === "en" ? "Endpoints" : "เอนด์พอยต์"}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg border font-mono text-[12px] text-foreground">
                    <Building className="h-3 w-3 text-muted-foreground shrink-0" /><span className="font-semibold truncate max-w-[120px]">{u.companyName || "CompanyDemo"}</span>
                  </div>
                  <span className={`text-[12px] font-mono font-black px-2 py-1 rounded tracking-wide border uppercase ${
                    u.role === "admin" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                    u.role === "superuser" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                    "bg-blue-500/10 text-White-500 border-blue-500/20"
                    }`}     >
                    {u.role || "user"}
                  </span>                  
                  <div className="p-1 text-muted-foreground/40 hidden sm:block"><ArrowUpRight className="h-3.5 w-3.5" /></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function RefreshCw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
     strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
     <path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
  );
}
