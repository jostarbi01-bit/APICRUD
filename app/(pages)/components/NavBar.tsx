"use client";

import React, { useEffect, useState } from "react";
import { Menu, X, ShieldAlert, User, LogOut, Loader2 } from "lucide-react";
import { translations, Language, Theme } from "../text";
import { useSession, signOut } from "@/lib/auth-client";
import { apiClient } from "@/lib/api";

interface NavProps {
  activeTab: string;
  setTab: (tab: any) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Language;
  setLang: (l: Language) => void;
}

export default function NavBar({ activeTab, setTab, theme, setTheme, lang, setLang }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const t = translations[lang];
  // const { data: session, isPending } = useSession();

   // Hook v1.6.25: Retrieve live database session properties reactively
  const { data: session, isPending: sessionPending } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [rolePending, setRolePending] = useState(false);

 // Asynchronously intercept session data to check the authorization role via the hierarchy endpoint
  useEffect(() => {
    if (!session?.user) {
      setUserRole(null);
      return;
    }
    setRolePending(true);
    apiClient.get("/admin/hierarchy")
      .then(() => setUserRole("admin"))
      .catch(() => setUserRole("user"))
      .finally(() => setRolePending(false));
  }, [session]);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut({ fetchOptions: { onSuccess: () => setTab("home") } });
  };

  const menuItems = [
    { id: "home", label: t.home },
    { id: "about", label: t.about },
    ...(session?.user ?        [{ id: "user manage" , label: t.usermanage  }] : []),
    ...(userRole === "admin" ? [{ id: "admin manage", label: t.adminPanel  }] : []),
    ...(userRole === "admin" ? [{ id: "dashboard"     , label: t.dashboard     }] : []),
    { id: "contact", label: t.contact }
  ];

   const isLoading = sessionPending || rolePending;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab("home")}>
          <ShieldAlert className="h-6 w-6 text-primary animate-pulse" />
          <span className="font-extrabold text-2xl tracking-tight">API.Engine</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {menuItems.map((item,idx) => (
            <button key={idx} onClick={() => setTab(item.id)} 
             className={`text- font-medium transition-colors 
             hover:text-primary ${activeTab === item.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <button onClick={() => setLang("en")} 
              className={`px-2 py-0.5 text-xs rounded ${lang === "en" ? "bg-primary text-primary-foreground shadow" : ""}`}>EN</button>
            <button onClick={() => setLang("th")} 
              className={`px-2 py-0.5 text-xs rounded ${lang === "th" ? "bg-primary text-primary-foreground shadow" : ""}`}>TH</button>
          </div>

          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)} 
          className="text-xs bg-secondary rounded-lg border-none p-1.5 focus:ring-1 focus:ring-primary outline-none">
            <option value="classic white">⚪ Light</option>
            <option value="classic dark">⚫ Dark</option>
            <option value="classic green">🟢 Green</option>
          </select>

          <div className="relative">
            {isLoading  ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : session?.user ? (
              <>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} 
                  className="flex items-center gap-2 bg-secondary text-sm p-1.5
                               rounded-full hover:ring-2 hover:ring-primary">
                  <User className="h-4 w-4" />
                  <span className="font-semibold text-xs pr-1">{session.user.name}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card border text-card-foreground p-3">
                    <p className="text-xs font-bold text-primary">Role {userRole} </p>
                    <p className="text-xs text-muted-foreground truncate mb-2">{session.user.email}</p>
                    <hr className="my-2" />
                    <button onClick={handleSignOut} className="w-full flex items-center justify-between 
                                            text-xs text-red-500 hover:bg-muted p-2 rounded">
                      <span>{t.signOut}</span>
                      <LogOut className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button onClick={() => setTab("home")} 
              className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 
                        rounded-md hover:opacity-90">Sign In</button>
            )}
          </div>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 bg-secondary rounded-md">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-3 p-4 bg-card border rounded-lg flex flex-col gap-4">
          {menuItems.map((item,idx) => (
            <button key={idx} onClick={() => { setTab(item.id); setMobileOpen(false); }} 
              className={`text-left text-sm font-semibold p-2 rounded
                           ${activeTab === item.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} >
              {item.label}
            </button>
          ))}
          <hr />
          {session?.user && (
            <button onClick={handleSignOut} 
              className="text-left text-sm font-semibold p-2 text-red-500 rounded 
                        hover:bg-muted flex items-center justify-between">
              <p className="text-xs font-bold text-primary">Role {userRole} </p>
              <p className="text-xs text-muted-foreground truncate mb-2">{session.user.email}</p>            
              <span>{t.signOut}</span>
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
