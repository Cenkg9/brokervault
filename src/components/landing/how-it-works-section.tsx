"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "I",
    title: "Join the Network",
    description: "Create your account in minutes. Access the full private listing feed and connect with verified brokers from day one.",
    preview: {
      type: "welcome",
      data: {
        name: "Alexandra Chen",
        role: "Luxury Real Estate Broker",
        location: "Dubai, UAE",
        status: "Active Member",
        since: "April 2025",
        listings: "12 active",
      },
    },
  },
  {
    number: "II",
    title: "Post Your Listings",
    description: "Submit your premium assets with photos and details. Your listing goes live to the entire verified member network.",
    preview: {
      type: "listing",
      data: {
        title: "Malibu Oceanfront Estate",
        price: "€12,500,000",
        location: "Malibu, California",
        category: "Luxury Real Estate",
        photos: "14 photos",
        status: "Active",
      },
    },
  },
  {
    number: "III",
    title: "Connect & Close",
    description: "Message directly with interested brokers. Every conversation is tied to a listing so context is never lost.",
    preview: {
      type: "message",
      data: {
        listing: "Malibu Oceanfront Estate",
        from: "James Liu",
        company: "Fraser Yachts",
        message: "Interested in arranging a private viewing for my client next week.",
        time: "Just now",
        status: "delivered",
      },
    },
  },
];

function WelcomePreview({ data }: { data: typeof steps[0]["preview"]["data"] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 pb-4 border-b border-background/10">
        <div className="w-12 h-12 rounded-full bg-background/10 flex items-center justify-center text-background font-display text-xl">
          {(data as any).name[0]}
        </div>
        <div>
          <div className="text-background font-medium">{(data as any).name}</div>
          <div className="text-background/50 text-sm">{(data as any).role}</div>
        </div>
      </div>
      {[
        { label: "Location", value: (data as any).location },
        { label: "Status", value: (data as any).status, highlight: true },
        { label: "Member since", value: (data as any).since },
        { label: "Active listings", value: (data as any).listings },
      ].map((row) => (
        <div key={row.label} className="flex justify-between items-center text-sm">
          <span className="text-background/40">{row.label}</span>
          <span className={row.highlight ? "text-green-400 font-mono" : "text-background/70 font-mono"}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function ListingPreview({ data }: { data: typeof steps[1]["preview"]["data"] }) {
  return (
    <div className="space-y-4">
      <div className="h-24 bg-background/5 border border-background/10 rounded flex items-center justify-center text-background/20 text-xs font-mono">
        14 photos · Private listing
      </div>
      {[
        { label: "Title", value: (data as any).title },
        { label: "Price", value: (data as any).price, highlight: true },
        { label: "Location", value: (data as any).location },
        { label: "Category", value: (data as any).category },
        { label: "Status", value: (data as any).status, green: true },
      ].map((row) => (
        <div key={row.label} className="flex justify-between items-center text-sm">
          <span className="text-background/40">{row.label}</span>
          <span className={
            (row as any).green ? "text-green-400 font-mono" :
            row.highlight ? "text-background font-mono font-medium" :
            "text-background/70 font-mono"
          }>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function MessagePreview({ data }: { data: typeof steps[2]["preview"]["data"] }) {
  return (
    <div className="space-y-4">
      <div className="text-xs font-mono text-background/30 pb-2 border-b border-background/10">
        Re: {(data as any).listing}
      </div>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center text-background font-display shrink-0">
          {(data as any).from[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-background text-sm font-medium">{(data as any).from}</span>
            <span className="text-background/30 text-xs">{(data as any).company}</span>
          </div>
          <div className="bg-background/10 rounded px-3 py-2 text-sm text-background/70 leading-relaxed">
            {(data as any).message}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-background/30 text-xs">{(data as any).time}</span>
            <span className="text-green-400 text-xs font-mono">✓ {(data as any).status}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2 pt-3 border-t border-background/10">
        <div className="flex-1 bg-background/5 border border-background/10 rounded px-3 py-2 text-sm text-background/20">
          Reply to James...
        </div>
        <div className="w-8 h-8 bg-background/20 rounded flex items-center justify-center text-background/40 text-xs">→</div>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const step = steps[activeStep];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden"
    >
      {/* Diagonal lines pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            currentColor 40px,
            currentColor 41px
          )`
        }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-background/50 mb-6">
            <span className="w-8 h-px bg-background/30" />
            Process
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Three steps.
            <br />
            <span className="text-background/50">One private vault.</span>
          </h2>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Steps */}
          <div className="space-y-0">
            {steps.map((s, index) => (
              <button
                key={s.number}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`w-full text-left py-8 border-b border-background/10 transition-all duration-500 group ${
                  activeStep === index ? "opacity-100" : "opacity-40 hover:opacity-70"
                }`}
              >
                <div className="flex items-start gap-6">
                  <span className="font-display text-3xl text-background/30">{s.number}</span>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-display mb-3 group-hover:translate-x-2 transition-transform duration-300">
                      {s.title}
                    </h3>
                    <p className="text-background/60 leading-relaxed">{s.description}</p>
                    {activeStep === index && (
                      <div className="mt-4 h-px bg-background/20 overflow-hidden">
                        <div className="h-full bg-background w-0" style={{ animation: "progress 5s linear forwards" }} />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Preview panel */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="border border-background/10 overflow-hidden">
              {/* Window header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-background/10 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-background/20" />
                  <div className="w-3 h-3 rounded-full bg-background/20" />
                  <div className="w-3 h-3 rounded-full bg-background/20" />
                </div>
                <span className="text-xs font-mono text-background/40">
                  {step.preview.type === "welcome" && "member-profile.bv"}
                  {step.preview.type === "listing" && "listing-detail.bv"}
                  {step.preview.type === "message" && "messages.bv"}
                </span>
              </div>

              {/* Preview content */}
              <div className="p-4 sm:p-8 min-h-[240px] sm:min-h-[280px]">
                <div key={activeStep} className="animate-fade-in">
                  {step.preview.type === "welcome" && <WelcomePreview data={step.preview.data} />}
                  {step.preview.type === "listing" && <ListingPreview data={step.preview.data} />}
                  {step.preview.type === "message" && <MessagePreview data={step.preview.data} />}
                </div>
              </div>

              {/* Status */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-background/10 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono text-background/40">Vault secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
