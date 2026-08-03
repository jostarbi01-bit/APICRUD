
import { translations, Language } from "../text";

export default function Footer({ lang }: { lang: Language }) {
  const t = translations[lang];

  return (
    <footer className="w-full border-t bg-card text-card-foreground mt-12 py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Legal and Rights Constraints Notices */}
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/80">© {new Date().getFullYear()} API.Engine. {t.rights}.</span>
          <span className="hidden sm:inline">|</span>
          <a href="#legal" className="hover:text-primary underline transition-colors">{t.legal}</a>
        </div>

        {/* 4 Multi-Channel Network Media References */}
        <div className="flex items-center gap-4">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-1.5 bg-background rounded-full border text-muted-foreground hover:text-primary hover:border-primary transition-all">
             Facebook
          </a>
          <a href="https://x.com" target="_blank" rel="noreferrer" className="p-1.5 bg-background rounded-full border text-muted-foreground hover:text-primary hover:border-primary transition-all">
            X
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="p-1.5 bg-background rounded-full border text-muted-foreground hover:text-primary hover:border-primary transition-all">
            Youtube 
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="p-1.5 bg-background rounded-full border text-muted-foreground hover:text-primary hover:border-primary transition-all">
            <span className="text-xs font-black px-0.5 tracking-tighter">🎵</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
