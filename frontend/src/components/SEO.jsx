import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, path }) => {
  const baseUrl = "https://morkunas.info";
  const fullUrl = `${baseUrl}${path || ''}`;
  const defaultDescription = "Audrius Morkūnas Portfolio - Developer and Creator of AdotByte AI. Linux, Docker, Django, and React.";
  const siteName = "Audrius Morkūnas | Portfolio";

  // 1. Define the Schema Data
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Audrius Morkūnas",
    "url": baseUrl,
    "jobTitle": "IT enthusiast",
    "description": defaultDescription,
    "sameAs": [
      "https://github.com/adotbyte", // Update with your actual links
      "https://www.linkedin.com/in/audrius-morkunas-939a2581/"
    ],
    "knowsAbout": ["Django", "React", "Linux", "Docker", "AI Development", "Python"]
  };

  return (
    <Helmet>
      {/* ... Standard and OG tags from before ... */}
      <title>{title ? `${title} | ${siteName}` : siteName}</title>
      <meta name="description" content={description || defaultDescription} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={`${baseUrl}/static/images/logo.png`} />

      {/* 2. Inject JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>
    </Helmet>
  );
};

export default SEO;