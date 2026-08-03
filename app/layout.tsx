import React from "react";
import { Metadata, Viewport } from "next";
import "@/app/app.css";

// 1. Universal Responsive Layout Settings [2.1]
export const viewport: Viewport = {
  // themeColor: "#221.2 83.2% 53.3%", 
  themeColor: "#142.1 70.6% 45.3%", 
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
};

// 2. Comprehensive SEO & OpenGraph Social Meta Tags Schema [1]
export const metadata: Metadata = {
  title: {
    default: "API.Engine | Next-Gen Multi-Tenant API Testing Workspace",
    template: "%s | API.Engine Workspace",
  },
  description: "Instantly create, deploy, mock, and test scalable REST parameters. Secure multi-tenant architecture with real-time JSON log inspectors and RBAC controls.",
  keywords: ["API Testing", "REST Client", "Mock API Server", "Multi-tenant API", "Next.js API Engine", "Drizzle ORM", "Better Auth"],
  authors: [{ name: "API Engine Core Dev Team" }],
  creator: "API Engine DevOps",
  metadataBase: new URL("https://api-engine.workspace"), // Replace with your live public production URL domain string [1]
  
  // Search Engine Robot Indexing Controls
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // OpenGraph Social Media Preview Specifications [1]
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "th_TH",
    url: "https://api-engine.workspace",
    title: "API.Engine - Agile Multi-Tenant API Test Sandbox",
    description: "Validate and reverse-proxy all CRUD methods (GET, POST, PUT, DELETE) dynamically. Built for agile development team environments.",
    siteName: "API.Engine Project Portal",
    images: [
      {
        url: "/og-banner-matrix.png", // Place an attractive marketing graphic inside your public/ directory
        width: 1200,
        height: 630,
        alt: "API.Engine Automation Workbench Preview Display Banner",
      },
    ],
  },

    //// Twitter/X Preview Cards Scheme [1]
  twitter: {
    card: "summary_large_image",
    title: "API.Engine Framework Testing Platform",
    description: "原子的な状態変更と連動したREST APIモック＆テスト用マルチテナント型統合開発環境(IDE)",
    images: ["/og-banner-matrix.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // <html lang="en" scroll-behavior="smooth" >
    <html lang="en"  >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="canonical" href="https://api-engine.workspace" />
      </head>
      {/* <body className="antialiased font-sans transition-colors duration-200 selection:bg-primary/20 selection:text-primary-foreground"> */}
     
      <body  >
        {children}
      </body>
      
    </html>
  );
}
