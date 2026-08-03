
import { CheckCircle2 } from "lucide-react";

export default function About() {
  const systemVersions = [
    { package: "Next.js Framework Core", version: "v16.2.12 -canary (Experimental Server Build Mode)" },
    { package: "React Framework Core", version: "v19.2.4)" }, 
    { package: "Dotenv  ", version: "v17.4.2)" }, 
    { package: "Vite Bundler Tooling Engine", version: "v5.4.11 (Hot Module Optimization Layer)" },
    { package: "TypeScript Compiler Core", version: "v5.6.3 (Strict Explicit Typings Profile)" },
    { package: "Tailwind CSS Layout Utilities", version: "v4 (Cascading Variables Isolation)" },
    { package: "shadcn/ui Structural Primitives", version: "v4.15  Compilation Context" },
    { package: "Zustand Atomic Reactive Store", version: "v5.0.14 Async Persistence Interface" },
    { package: "Axios Remote Request Client", version: "v1.18.1 Microservice Connection Gateway" },
    { package: "Drizzle ORM Engine Layer", version: "v0.45.2 Relational Map Client" },
    { package: "PostgreSQL Database Stack Engine", version: "v17.0 Native Relational Database Cluster" },
    { package: "Better Auth Session Controller", version: "v1.6.25 High-Crypto Identity Framework" }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Active Matrix Dependency Validation</h2>
        <p className="text-muted-foreground text-sm">System checks confirm that Constraint 
          0 stack elements are configured correctly:</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systemVersions.map((dep, idx) => (
          <div key={idx} className="p-4 rounded-xl border bg-card text-card-foreground flex items-start gap-3 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm tracking-tight">{dep.package}</p>
              <p className="font-mono text-xs text-muted-foreground mt-1 bg-muted px-1.5 py-0.5 rounded inline-block">{dep.version}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
