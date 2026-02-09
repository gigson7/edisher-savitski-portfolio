"use client";

import { useState } from "react";
import { Performance, PerformanceType } from "@/types";
import { EventCard } from "./EventCard";
import { getYear } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface EventsListProps {
  performances: Performance[];
  title: string;
}

const ITEMS_PER_PAGE = 21;

export function EventsList({ performances, title }: EventsListProps) {
  const [selectedType, setSelectedType] = useState<PerformanceType | "all">("all");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  // Get unique years
  const years = Array.from(
    new Set(performances.map((p) => getYear(p.date)))
  ).sort((a, b) => b - a);

  // Filter performances
  const filteredPerformances = performances.filter((p) => {
    const typeMatch = selectedType === "all" || p.type === selectedType;
    const yearMatch = selectedYear === "all" || getYear(p.date) === selectedYear;
    return typeMatch && yearMatch;
  });

  // Reset display count when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setDisplayCount(ITEMS_PER_PAGE);
  };

  // Get performances to display (limited by displayCount)
  const displayedPerformances = filteredPerformances.slice(0, displayCount);
  const hasMore = displayCount < filteredPerformances.length;

  const loadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-semibold text-primary-800 mb-6">
          {title}
        </h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) =>
                handleFilterChange(() =>
                  setSelectedType(e.target.value as PerformanceType | "all")
                )
              }
              className="px-4 py-2 border border-primary-300 rounded-md text-primary-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="all">All Types</option>
              <option value="solo">Solo</option>
              <option value="chamber">Chamber</option>
              <option value="orchestra">Orchestra</option>
              <option value="masterclass">Masterclass</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) =>
                handleFilterChange(() =>
                  setSelectedYear(e.target.value === "all" ? "all" : parseInt(e.target.value))
                )
              }
              className="px-4 py-2 border border-primary-300 rounded-md text-primary-700 focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="all">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-sm text-primary-600">
          Showing {displayedPerformances.length} of {filteredPerformances.length} performances
        </p>
      </div>

      {/* Events Grid */}
      {filteredPerformances.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPerformances.map((performance) => (
              <EventCard key={performance.id} performance={performance} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-12 text-center">
              <Button
                onClick={loadMore}
                variant="outline"
                size="lg"
              >
                Load More
              </Button>
              <p className="mt-4 text-sm text-primary-600">
                {filteredPerformances.length - displayCount} more performances
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-primary-600">No performances found with the selected filters.</p>
        </div>
      )}
    </div>
  );
}
