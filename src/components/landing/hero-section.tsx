"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimatedSphere } from "./animated-sphere";

const words = ["list", "deal", "connect", "close"];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Animated sphere background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[220px] h-[220px] sm:w-[380px] sm:h-[380px] lg:w-[800px] lg:h-[800px] opacity-10 sm:opacity-20 lg:opacity-40 pointer-events-none">
        <AnimatedSphere />
      </div>

      {/* Subtle grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-32 pb-48 sm:pb-44 lg:py-40">
        {/* Eyebrow */}
        <div
          className={`mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="w-8 h-px bg-foreground/30" />
            The private network for elite brokers
          </span>
        </div>

        {/* Main headline */}
        <div className="mb-12">
          <h1
            className={`text-[clamp(3rem,12vw,10rem)] font-display leading-[0.9] tracking-tight transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block">The vault to</span>
            <span className="block">
              <span className="relative inline-block">
                <span
                  key={wordIndex}
                  className="inline-flex"
                >
                  {words[wordIndex].split("").map((char, i) => (
                    <span
                      key={`${wordIndex}-${i}`}
                      className="inline-block animate-char-in"
                      style={{
                        animationDelay: `${i * 50}ms`,
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-foreground/10" />
              </span>
            </span>
          </h1>
        </div>

        {/* Description */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-end">
          <p
            className={`text-base sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Your private marketplace to stop searching and start closing.
            Securely list, discover, and broker luxury real estate and goods.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4 transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Button
              size="lg"
              className="bg-foreground hover:bg-foreground/90 text-background px-8 h-12 sm:h-14 text-sm sm:text-base rounded-full group"
              asChild
            >
              <a href="/signup">
                Join BrokerVault
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 sm:h-14 px-8 text-sm sm:text-base rounded-full border-foreground/20 hover:bg-foreground/5"
              asChild
            >
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats marquee - full width outside container */}
      <div
        className={`absolute bottom-24 left-0 right-0 transition-all duration-700 delay-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex gap-8 sm:gap-12 lg:gap-16 marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-8 sm:gap-12 lg:gap-16">
              {[
                { value: "500+", label: "verified brokers", note: "MEMBERS" },
                { value: "€2.4B", label: "in active listings", note: "VOLUME" },
                { value: "38", label: "cities covered", note: "GLOBAL" },
                { value: "100%", label: "private network", note: "SECURE" },
              ].map((stat) => (
                <div key={`${stat.note}-${i}`} className="flex items-baseline gap-2 sm:gap-4">
                  <span className="text-2xl sm:text-3xl lg:text-5xl font-display">{stat.value}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {stat.label}
                    <span className="block font-mono text-[10px] sm:text-xs mt-0.5 sm:mt-1">{stat.note}</span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
