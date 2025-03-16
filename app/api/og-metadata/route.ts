import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SurfAcademyBot/1.0; +https://surfacademy.example.com)'
      }
    });
    
    const html = await response.text();
    
    // Extract Open Graph metadata
    const ogImage = getMetaTag(html, 'og:image') || 
                    getMetaTag(html, 'twitter:image') ||
                    getMetaContent(html, 'image');
    
    const ogTitle = getMetaTag(html, 'og:title') || 
                    getMetaTag(html, 'twitter:title') ||
                    getPageTitle(html);
    
    const ogDescription = getMetaTag(html, 'og:description') || 
                          getMetaTag(html, 'twitter:description') ||
                          getMetaTag(html, 'description');
    
    return NextResponse.json({
      success: true,
      metadata: {
        url,
        image: ogImage,
        title: ogTitle,
        description: ogDescription,
      }
    });
  } catch (error) {
    console.error('Error fetching OG metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}

// Helper function to extract meta tags from HTML
function getMetaTag(html: string, property: string): string | null {
  // For tags with property attribute
  const regexProperty = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const matchProperty = html.match(regexProperty);
  
  if (matchProperty && matchProperty[1]) {
    return matchProperty[1];
  }
  
  // For tags with content that comes before property
  const altRegexProperty = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["'][^>]*>`, 'i');
  const altMatchProperty = html.match(altRegexProperty);
  
  if (altMatchProperty && altMatchProperty[1]) {
    return altMatchProperty[1];
  }
  
  // For tags with name attribute
  const regexName = new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const matchName = html.match(regexName);
  
  if (matchName && matchName[1]) {
    return matchName[1];
  }
  
  // For tags with content that comes before name
  const altRegexName = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["'][^>]*>`, 'i');
  const altMatchName = html.match(altRegexName);
  
  if (altMatchName && altMatchName[1]) {
    return altMatchName[1];
  }
  
  return null;
}

// Function to extract meta tags by name attribute
function getMetaContent(html: string, name: string): string | null {
  const regex = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const match = html.match(regex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

// Function to extract the page title
function getPageTitle(html: string): string | null {
  const regex = /<title[^>]*>(.*?)<\/title>/i;
  const match = html.match(regex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
} 