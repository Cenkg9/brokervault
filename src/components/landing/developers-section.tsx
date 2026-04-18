"use client";

import { useState, useEffect, useRef } from "react";
import { Bookmark, MessageSquare, Search } from "lucide-react";

const tabs = [
  { label: "Browse", icon: Search },
  { label: "Message", icon: MessageSquare },
  { label: "Saved", icon: Bookmark },
];

function BrowsePreview() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pb-3 border-b border-foreground/10">
        <div className="flex-1 h-8 bg-foreground/5 rounded border border-foreground/10 flex items-center px-3 min-w-0">
          <span className="text-xs text-muted-foreground truncate">Search listings...</span>
        </div>
        <div className="flex gap-1 shrink-0">
          {["All", "RE", "Cars"].map((f) => (
            <div key={f} className={`px-2 py-1 text-xs rounded border ${f === "All" ? "bg-foreground text-background border-foreground" : "border-foreground/10 text-muted-foreground"}`}>
              {f}
            </div>
          ))}
        </div>
      </div>
      {[
        { title: "Malibu Oceanfront Estate", price: "€12.5M", loc: "Malibu, CA", tag: "Real Estate", new: true },
        { title: "Ferrari SF90 Stradale", price: "€580K", loc: "Monaco", tag: "Supercar", new: false },
        { title: "Sunseeker 95 Yacht", price: "€3.2M", loc: "Côte d'Azur", tag: "Yacht", new: true },
      ].map((listing) => (
        <div key={listing.title} className="flex items-center gap-2 p-2.5 border border-foreground/10 hover:border-foreground/20 rounded transition-colors group">
          <div className="w-9 h-9 bg-foreground/5 rounded flex-shrink-0 flex items-center justify-center text-base">
            {listing.tag === "Real Estate" ? "🏛" : listing.tag === "Supercar" ? "🚗" : "⛵"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium truncate">{listing.title}</p>
              {listing.new && <span className="text-[9px] px-1 py-0.5 bg-green-100 text-green-700 rounded-full shrink-0">New</span>}
            </div>
            <p className="text-[10px] text-muted-foreground truncate">{listing.loc} · {listing.tag}</p>
          </div>
          <p className="text-xs font-medium shrink-0">{listing.price}</p>
        </div>
      ))}
    </div>
  );
}

function MessagePreview() {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground pb-2 border-b border-foreground/10">
        3 conversations
      </div>
      {[
        { name: "Alexandra Chen", listing: "Malibu Oceanfront Estate", msg: "Would your client consider a 10% reduction?", time: "2m", unread: 2 },
        { name: "James Liu", listing: "Sunseeker 95 Yacht", msg: "I have a serious buyer. When can we arrange?", time: "1h", unread: 1 },
        { name: "Elena Rodriguez", listing: "Ferrari SF90 Stradale", msg: "Documents confirmed, ready to proceed.", time: "3h", unread: 0 },
      ].map((conv) => (
        <div key={conv.name} className={`flex items-start gap-2 p-2.5 rounded border transition-colors ${conv.unread > 0 ? "border-foreground/20 bg-foreground/[0.02]" : "border-foreground/10"}`}>
          <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-medium shrink-0">
            {conv.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-1">
              <p className="text-xs font-medium truncate">{conv.name}</p>
              <span className="text-[10px] text-muted-foreground shrink-0">{conv.time}</span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">{conv.listing}</p>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{conv.msg}</p>
          </div>
          {conv.unread > 0 && (
            <div className="w-4 h-4 rounded-full bg-foreground text-background text-[9px] flex items-center justify-center shrink-0 mt-0.5">
              {conv.unread}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SavedPreview() {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground pb-2 border-b border-foreground/10">
        4 saved listings
      </div>
      {[
        { title: "Villa Cap-Ferrat", price: "€28M", loc: "French Riviera", saved: "2 days ago" },
        { title: "Lamborghini Revuelto", price: "€420K", loc: "Geneva", saved: "4 days ago" },
        { title: "Penthouse Dubai Marina", price: "€5.8M", loc: "Dubai, UAE", saved: "1 week ago" },
        { title: "Riva Aquarama Special", price: "€890K", loc: "Lake Como", saved: "2 weeks ago" },
      ].map((item) => (
        <div key={item.title} className="flex items-center gap-2 p-2.5 border border-foreground/10 rounded hover:border-foreground/20 transition-colors">
          <Bookmark className="w-3.5 h-3.5 text-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{item.title}</p>
            <p className="text-[10px] text-muted-foreground truncate">{item.loc} · {item.saved}</p>
          </div>
          <p className="text-xs font-medium shrink-0">{item.price}</p>
        </div>
      ))}
    </div>
  );
}

const features = [
  {
    title: "Verified network",
    description: "Every broker is vetted before they can list or message."
  },
  {
    title: "Secure messaging",
    description: "Encrypted threads tied to specific listings."
  },
  {
    title: "Quality listings",
    description: "Every listing comes from a verified broker. No noise."
  },
  {
    title: "Mobile-first",
    description: "Fully responsive for brokers on the move."
  },
];

export function DevelopersSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  return (
    <section id="members" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              For brokers
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              Built for brokers.
              <br />
              <span className="text-muted-foreground">Made private.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              A clean, focused platform designed around how brokers actually work.
              No noise, no public exposure — just the deals that matter.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`transition-all duration-500 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 50 + 200}ms` }}
                >
                  <h3 className="font-medium mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Platform preview */}
          <div
            className={`lg:sticky lg:top-32 min-w-0 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="border border-foreground/10 rounded-lg overflow-hidden shadow-sm w-full">
              {/* Tabs */}
              <div className="flex items-center border-b border-foreground/10 bg-foreground/[0.01]">
                {tabs.map((tab, idx) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.label}
                      type="button"
                      onClick={() => setActiveTab(idx)}
                      className={`flex items-center gap-1.5 px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors relative ${
                        activeTab === idx
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      {tab.label}
                      {activeTab === idx && (
                        <span className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Preview content */}
              <div className="p-4 sm:p-5 min-h-[280px] sm:min-h-[320px]">
                <div key={activeTab} style={{ animation: "fadeSlideIn 0.3s ease forwards" }}>
                  {activeTab === 0 && <BrowsePreview />}
                  {activeTab === 1 && <MessagePreview />}
                  {activeTab === 2 && <SavedPreview />}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-6 text-sm">
              <a href="/signup" className="text-foreground hover:underline underline-offset-4">
                Join BrokerVault
              </a>
              <span className="text-foreground/20">|</span>
              <a href="/login" className="text-muted-foreground hover:text-foreground">
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
