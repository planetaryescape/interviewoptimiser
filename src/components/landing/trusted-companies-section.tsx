export function TrustedCompaniesSection() {
  const companies = [
    { name: "Google", logo: "/logos/google.svg" },
    { name: "Microsoft", logo: "/logos/microsoft.svg" },
    { name: "Amazon", logo: "/logos/amazon.svg" },
    { name: "Meta", logo: "/logos/meta.svg" },
    { name: "Apple", logo: "/logos/apple.svg" },
    { name: "Netflix", logo: "/logos/netflix.svg" },
    { name: "Spotify", logo: "/logos/spotify.svg" },
    { name: "Adobe", logo: "/logos/adobe.svg" },
    { name: "Salesforce", logo: "/logos/salesforce.svg" },
    { name: "IBM", logo: "/logos/ibm.svg" },
    { name: "Oracle", logo: "/logos/oracle.svg" },
    { name: "Tesla", logo: "/logos/tesla.svg" },
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container px-4 mx-auto">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Trusted by professionals from leading companies
        </p>
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll">
            <div className="flex gap-12 pr-12">
              {companies.map((company) => (
                <div
                  key={company.name}
                  className="flex items-center justify-center min-w-[120px] h-12 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all"
                >
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-8 w-auto object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-12 pr-12" aria-hidden="true">
              {companies.map((company) => (
                <div
                  key={`${company.name}-duplicate`}
                  className="flex items-center justify-center min-w-[120px] h-12 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all"
                >
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-8 w-auto object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
