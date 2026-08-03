import React from "react";
// import "../globals.css";
import "../app.css";

export const metadata = {
  title: "API Engine Workspace",
  description: "Next.js 16 REST Framework Testing Workbench",
};

export default function RootLayout({  children,}: { children: React.ReactNode;}) 
{
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>


      {/* <body className="antialiased"  > */}
      <body   >

        {children}
      
      </body>
    
    </html>
  );
}
