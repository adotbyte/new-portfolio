import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, path }) => {
  const baseUrl = "https://morkunas.info";
  const fullUrl = `${baseUrl}${path || ''}`;
  const defaultDescription = "Audrius Morkūnas Portfolio - Creator of AdotByte AI. Linux, Docker, Django, and React.";
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
      {/* Standard Metadata */}
      <title>{title ? `${title} | ${siteName}` : siteName}</title>
      <meta name="description" content={description || defaultDescription} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook (Explicitly provided) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title ? `${title} | ${siteName}` : siteName} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:site_name" content={siteName} />
      {/* Ensure this path is 100% correct and accessible publicly */}
      <meta property="og:image" content={`${baseUrl}/images/logo.png`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Tags (Helpful for full SEO) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteName} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={`${baseUrl}/images/logo.png`} />

      {/* Inject JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>
    </Helmet>
  );
}
export default SEO;