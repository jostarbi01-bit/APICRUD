"use client";
import { useState, useEffect } from "react";
import { Language, Theme } from "./text";
import NavBar from "./components/NavBar";
import HeroSection from "./components/HeroSection";
import About from "./components/About";
import AdminManage from "./components/AdminManage";
// import History from "./components/Dashboard";
import Dashboard from "./components/Dashboard";
import UserManage from "./components/UserManage";
import Footer from "./components/Footer";
import SignInCard from "./components/SignInCard";
import SignUpCard from "./components/SignUpCard";
import { useSession } from "@/lib/auth-client";
import { apiClient } from "@/lib/api";



// type TabRoutes = "home" | "about" | "user manage" | "admin manage" | "contact" | "history";

export default function Home() {

  const [authView, setAuthView] = useState<"signin" | "signup">("signin");

  // Safe SSR Initializers: Provide default state values that won't crash on the server  
  const [currentTab, setCurrentTab] = useState<"home" | "about" | "user manage" |"admin manage"| "contact"| "dashboard" >("home");
  const [theme, setTheme] = useState<Theme>("classic dark");
  const [lang, setLang] = useState<Language>("en");
 
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);


  // Frist SingIn  Async role-checking interceptor guarding Tab accessibility properties
  useEffect(() => { 
    if (!session?.user) {
      setUserRole(null);
    if (currentTab === "user manage" || currentTab === "admin manage" || currentTab === "dashboard" ) {
        setCurrentTab("home");
    }
      return; 
    }
  
    // Check While switch Tab on page NavBar
    const checkAdministrativeClearance = async () => {
      try {
        // Hits the secure hierarchy query. A 200 OK maps account properties to Admin
        await apiClient.get("/admin/hierarchy");
        setUserRole("admin");     
      } 
      catch (err: any) {
        // SAFE OVERRIDE: If server blocks with 403 Forbidden, user is a standard operator.
        // We set the state cleanly without throwing fatal application errors.
        setUserRole("user");
        
        // If user accidentally clicks into the Admin Panel during role shifts, drop back to safe tabs
        if (currentTab === "admin manage") {
          setCurrentTab("home");
        }
      }
    };
    checkAdministrativeClearance();
  }, [session, currentTab]);

  // Frist SingIn  Hydrate configurations via safe localStorage intercept mechanisms
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("app-theme") as Theme;
      const savedLang = localStorage.getItem("app-lang") as Language;
      if (savedTheme) setTheme(savedTheme);
      if (savedLang) setLang(savedLang);    
    }
    setMounted(true);
  }, []);

  // Persistent browser DOM mutations trackers on change NavBar
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("app-lang", lang);
  }, [lang, mounted]);

  // Prevent Hydration Mismatch: Render nothing until client hydration completes
  if (!mounted) return null;


  return (
    <div className="min-h-screen flex flex-col justify-between transition-colors duration-200">

      <NavBar activeTab={currentTab} setTab={setCurrentTab}
        theme={theme} setTheme={setTheme}
        lang={lang} setLang={setLang}
      />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">
        {currentTab === "home" && <HeroSection lang={lang} />}
        {currentTab === "about" && <About />}
        {currentTab === "user manage" && <UserManage lang={lang} />}
        {currentTab === "admin manage" && userRole === "admin" && (<AdminManage lang={lang} userRole={userRole} />   )}
        {currentTab === "dashboard" && session?.user && ( <Dashboard  lang={lang} /> )}
        {currentTab === "contact" && (
          <div className="p-8 text-center bg-card rounded-xl border shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Contact System Admins</h2>
            <p className="text-muted-foreground">Secure secure-gateway routing pipeline diagnostics available at dev@internal.local</p>
          </div>
        )}

        {currentTab === "home" && (
          <div className="py-2">
            {authView === "signin" ? (
              <SignInCard
                lang={lang} onSuccess={() => setCurrentTab("user manage")}
                onSwitchToSignUp={() => setAuthView("signup")}
              />
            ) : (
              <SignUpCard  
                lang={lang}  onSuccess={() => {setAuthView("signin"); setCurrentTab("user manage") } }
                onSwitchToSignIn={() => setAuthView("signin")}
              />
            )}
          </div>
        )}

      </main>

      <Footer lang={lang} />
    </div>
  );
}
