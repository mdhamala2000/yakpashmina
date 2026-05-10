import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({ 
  title, 
  description, 
  image, 
  url, 
  type = "website",
  schema
}) => {
  const defaultImage = "/logo.jpg";
  const siteName = "Yak Pashmina";
  const fullUrl = url ? `https://yakpashamina.com${url}` : "https://yakpashamina.com";

  return (
    <Helmet>
      <title>{title ? `${title} | ${siteName}` : `${siteName} - Premium Handwoven Pashmina from Nepal`}</title>
      <meta name="description" content={description || "Authentic handwoven Pashmina shawls and scarves directly from Nepal. 100% cashmere, handcrafted by skilled artisans."} />
      
      <link rel="canonical" href={fullUrl} />

      <meta property="og:title" content={title || siteName} />
      <meta property="og:description" content={description || "Authentic handwoven Pashmina from Nepal"} />
      <meta property="og:image" content={image ? `https://yakpashamina.com${image}` : defaultImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteName} />
      <meta name="twitter:description" content={description || "Authentic handwoven Pashmina from Nepal"} />
      <meta name="twitter:image" content={image ? `https://yakpashamina.com${image}` : defaultImage} />

      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;