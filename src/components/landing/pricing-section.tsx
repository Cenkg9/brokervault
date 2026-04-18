"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

const features = [
  "Post unlimited listings",
  "Unlimited direct messaging",
  "Full broker dashboard",
  "Browse the entire private network",
  "Save listings to your watchlist",
  "Priority listing placement",
  "Analytics & saved searches",
  "Early access to new listings",
  "Priority support",
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  const price = isAnnual ? 119.99 : 149.99;

  return (
    <section id="pricing" className="relative py-32 lg:py-40 border-t border-foreground/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase block mb-6">
            Pricing
          </span>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground mb-6">
            One plan.
            <br />
            <span className="text-stroke">Full access.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mt-6">
            Everything you need to list, discover, and close deals — nothing held back.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-sm transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-14 h-7 bg-foreground/10 rounded-full p-1 transition-colors hover:bg-foreground/20"
          >
            <div
              className={`w-5 h-5 bg-foreground rounded-full transition-transform duration-300 ${
                isAnnual ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-sm transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual
          </span>
          {isAnnual && (
            <span className="ml-2 px-2 py-1 bg-foreground text-primary-foreground text-xs font-mono">
              Save 20%
            </span>
          )}
        </div>

        {/* Single Plan */}
        <div className="max-w-xl mx-auto">
          <div className="relative border-2 border-foreground p-6 sm:p-10 lg:p-14">
            {/* Price */}
            <div className="mb-8 sm:mb-10 pb-8 sm:pb-10 border-b border-foreground/10">
              <div className="flex items-baseline gap-2 sm:gap-3 mb-2">
                <span className="font-display text-5xl sm:text-7xl lg:text-8xl text-foreground">
                  €{price.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-muted-foreground text-base sm:text-lg">/month</span>
              </div>
              {isAnnual && (
                <p className="text-sm text-muted-foreground font-mono">Billed annually · Save €360/year</p>
              )}
            </div>

            {/* Features */}
            <ul className="grid sm:grid-cols-2 gap-4 mb-12">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href="/signup"
              className="w-full py-5 flex items-center justify-center gap-2 text-base font-medium bg-foreground text-primary-foreground hover:bg-foreground/90 transition-all group"
            >
              Join BrokerVault
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>

            {/* Decorative corners */}
            <div className="absolute -top-px -right-px w-8 h-8 border-b border-l border-background bg-background" />
            <div className="absolute -bottom-px -left-px w-8 h-8 border-t border-r border-background bg-background" />
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            All prices in EUR. Cancel anytime. No setup fees.
          </p>
        </div>
      </div>
    </section>
  );
}
