'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import { useEffect } from 'react';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] })

// Moving metadata from layout to a separate place
// This avoids the error of using 'use client' with metadata
const siteMetadata = {
  title: 'Surf Academy - Learn from the best',
  description: 'Learning platform with videos and articles about programming and technology',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{siteMetadata.title}</title>
        <meta name="description" content={siteMetadata.description} />
        <link rel="icon" href={siteMetadata.icons.icon} />
        
        {/* Dark mode initialization script - runs before any React code */}
        <Script
          id="dark-mode-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.error('Dark mode init error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-200`}>
        {children}
      </body>
    </html>
  )
}
