import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://oncallkit.threestack.io"),
  title: {
    default: "OnCallKit — Never Miss an Incident",
    template: "%s | OnCallKit",
  },
  description:
    "On-call scheduling, escalation policies, and multi-channel alerting for teams that ship fast. Starting at $9/mo.",
  keywords: [
    "on-call",
    "incident management",
    "escalation policies",
    "alerting",
    "pagerduty alternative",
    "opsgenie alternative",
    "monitoring alerts",
    "devops",
    "SRE",
    "oncallkit",
  ],
  openGraph: {
    title: "OnCallKit — Never Miss an Incident",
    description:
      "On-call scheduling, escalation policies, and multi-channel alerting for teams that ship fast.",
    url: "https://oncallkit.threestack.io",
    siteName: "OnCallKit",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OnCallKit — Never Miss an Incident",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OnCallKit — Never Miss an Incident",
    description:
      "On-call scheduling, escalation policies, and multi-channel alerting for teams that ship fast.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "OnCallKit",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "On-call scheduling, escalation policies, and multi-channel alerting for teams that ship fast.",
  url: "https://oncallkit.threestack.io",
  offers: {
    "@type": "Offer",
    price: "9",
    priceCurrency: "USD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "9",
      priceCurrency: "USD",
      billingDuration: "P1M",
    },
  },
  provider: {
    "@type": "Organization",
    name: "ThreeStack",
    url: "https://threestack.io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body style={{ backgroundColor: "#0f0e1a", color: "#e2e8f0" }}>
        {children}
      </body>
    </html>
  );
}
