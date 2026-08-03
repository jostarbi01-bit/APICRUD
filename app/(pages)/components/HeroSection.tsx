import { Terminal, Cpu, ArrowRight } from "lucide-react";
import { translations, Language } from "../text";


interface User {
  id: number;
  name: string;
  email: string;
  company?: string;
  role: "guest" | "user" | "superuser" | "admin";
}
 const poke_api = "https://pokeapi.co/api/v2/pokemon?offset=10&limit=10";
 const cat_api = "https://api.ai-cats.net/v2/cats/search?type=image&size=1024&limit=10";
 

export default function HeroSection({ lang }: { lang: Language }) {
  const t = translations[lang];

  return (
    <div className="relative py-3 md:py-6 flex flex-col items-center text-center max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border
                     border-primary/20 text-primary text-xs font-medium mb-4">
        <Cpu className="h-3 w-3 " /> Next.js 16 + Better Auth Engine Operational Environment
      </div>
      
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-linear-to-r from-foreground
                     via-foreground/80 to-primary bg-clip-text text-transparent mb-6">
        {t.heroTitle}
      </h1>
      
      <p className="text-base md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
        {t.heroSubtitle}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
        <button className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg 
              text-sm font-semibold shadow hover:opacity-90 transition-opacity   " >
          <span>{t.getStarted}</span>
          <ArrowRight className="h-4 w-4 animate-pulse " />
        </button>
        <button className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground border 
                    px-6 py-3 rounded-lg text-sm font-semibold hover:bg-secondary/80 transition-colors">
          <Terminal className="h-4 w-4" />
          <span>{t.learnMore}</span>
        </button>
      </div>
    </div>
  );
}


