"use client";

import { useState, useEffect, useRef } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, categoryLabel } from "@/lib/utils";
import type { FilterState } from "@/types";

const CATEGORIES = ["REAL_ESTATE", "LUXURY_CARS", "YACHTS", "OTHER"] as const;
const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price_asc", label: "Price: Low to high" },
  { value: "price_desc", label: "Price: High to low" },
];

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  role?: string;
}

function formatNum(val: string) {
  const raw = val.replace(/\D/g, "");
  return raw ? Number(raw).toLocaleString("en-US") : "";
}
function parseNum(val: string) {
  const raw = val.replace(/\D/g, "");
  return raw ? Number(raw) : undefined;
}

export default function ListingFilters({ filters, onChange, role }: Props) {
  const [minInput, setMinInput] = useState(filters.minPrice ? filters.minPrice.toLocaleString("en-US") : "");
  const [maxInput, setMaxInput] = useState(filters.maxPrice ? filters.maxPrice.toLocaleString("en-US") : "");
  const [locationInput, setLocationInput] = useState(filters.location ?? "");
  const locationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  // Debounce location — only fires 600ms after user stops typing
  const handleLocationChange = (val: string) => {
    setLocationInput(val);
    if (locationTimer.current) clearTimeout(locationTimer.current);
    locationTimer.current = setTimeout(() => {
      update({ location: val.trim() || undefined });
    }, 600);
  };

  const applyPrice = () => {
    update({
      minPrice: parseNum(minInput),
      maxPrice: parseNum(maxInput),
    });
  };

  const clearAll = () => {
    setMinInput(""); setMaxInput(""); setLocationInput("");
    if (locationTimer.current) clearTimeout(locationTimer.current);
    onChange({});
  };

  const activeCount = [
    filters.category,
    filters.minPrice || filters.maxPrice,
    filters.location,
    filters.sortBy && filters.sortBy !== "newest",
    filters.status,
  ].filter(Boolean).length;

  return (
    <aside className="w-56 shrink-0 hidden lg:flex flex-col py-6 overflow-y-auto select-none">
      <div className="rounded-lg border bg-card p-4 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {activeCount > 0 && (
              <span className="ml-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </h2>
          {activeCount > 0 && (
            <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-0.5 transition-colors">
              <X className="h-3 w-3" /> Clear all
            </button>
          )}
        </div>

        {/* Category */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Category</p>
          <div className="space-y-0.5">
            <button
              onClick={() => update({ category: undefined })}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                !filters.category ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent text-foreground"
              )}
            >
              All categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => update({ category: cat })}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  filters.category === cat ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent text-foreground"
                )}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Price range */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Price Range (EUR)</p>
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
              <input
                inputMode="numeric"
                placeholder="Min"
                value={minInput}
                onChange={(e) => setMinInput(formatNum(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && applyPrice()}
                className="h-8 w-full rounded-md border border-input bg-background pl-6 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
              <input
                inputMode="numeric"
                placeholder="Max"
                value={maxInput}
                onChange={(e) => setMaxInput(formatNum(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && applyPrice()}
                className="h-8 w-full rounded-md border border-input bg-background pl-6 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <Button
              size="sm"
              variant={filters.minPrice || filters.maxPrice ? "default" : "secondary"}
              className="w-full h-8 text-xs"
              onClick={applyPrice}
            >
              Apply price
            </Button>
            {(filters.minPrice || filters.maxPrice) && (
              <button
                onClick={() => { setMinInput(""); setMaxInput(""); update({ minPrice: undefined, maxPrice: undefined }); }}
                className="text-xs text-muted-foreground hover:text-destructive w-full text-center transition-colors"
              >
                × Clear price filter
              </button>
            )}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Location */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Location</p>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="City, country..."
              value={locationInput}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {locationInput && (
              <button
                onClick={() => { setLocationInput(""); update({ location: undefined }); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          {filters.location && (
            <p className="text-[10px] text-muted-foreground mt-1">Showing results near &quot;{filters.location}&quot;</p>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Status — VIP/OWNER only */}
        {(role === "VIP" || role === "OWNER") && (
          <>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Status</p>
              <div className="space-y-0.5">
                {[
                  { value: "all", label: "All listings" },
                  { value: "active", label: "Active only" },
                  { value: "pending", label: "Coming soon" },
                ].map((o) => (
                  <button
                    key={o.value}
                    onClick={() => update({ status: o.value === "all" ? undefined : o.value as FilterState["status"] })}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                      (!filters.status && o.value === "all") || filters.status === o.value
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-accent text-foreground"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-px bg-border" />
          </>
        )}

        {/* Sort */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Sort by</p>
          <div className="space-y-0.5">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => update({ sortBy: o.value as FilterState["sortBy"] })}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  (filters.sortBy === o.value || (!filters.sortBy && o.value === "newest"))
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-accent text-foreground"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}
