import { Performance } from "@/types";
import { Card } from "@/components/ui/Card";
import { formatDateShort } from "@/lib/utils";
import { Calendar, MapPin, Music, Users } from "lucide-react";

interface EventCardProps {
  performance: Performance;
}

export function EventCard({ performance }: EventCardProps) {
  return (
    <Card hover className="flex flex-col h-full">
      {!performance.isPast && (
        <div className="mb-5">
          <span className="text-xs font-medium text-gold-600 px-3 py-1 border border-gold-400 rounded">Upcoming</span>
        </div>
      )}

      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        {performance.title}
      </h3>

      <div className="space-y-3 flex-grow">
        <div className="flex items-start gap-2 text-lg text-neutral-600">
          <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-600" />
          <span>{formatDateShort(performance.date)}</span>
        </div>

        <div className="flex items-start gap-2 text-lg text-neutral-600">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-600" />
          <span>
            {performance.venue}
            {performance.location && `, ${performance.location}`}
          </span>
        </div>

        {performance.organization && (
          <div className="flex items-start gap-2 text-lg text-neutral-600">
            <Music className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-600" />
            <span>{performance.organization}</span>
          </div>
        )}

        {performance.collaborators && performance.collaborators.length > 0 && (
          <div className="flex items-start gap-2 text-lg text-neutral-600">
            <Users className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-600" />
            <span>{performance.collaborators.join(", ")}</span>
          </div>
        )}

        {performance.repertoire && performance.repertoire.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">Repertoire:</p>
            <p className="text-lg text-neutral-600">
              {performance.repertoire.join(", ")}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
