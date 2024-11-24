"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useTripContext } from "@/context/TripContext";

interface DateStepProps {
  onNext: () => void;
}

export default function DateStep({ onNext }: DateStepProps) {
  const { tripData, updateTripData } = useTripContext();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleCalendarClick = () => {
    if (tripData.dates.from && tripData.dates.to && !isSelecting) {
      updateTripData('dates', { from: undefined, to: undefined });
      setIsSelecting(true);
    }
  };

  const handleSelect = (range: DateRange | undefined) => {
    updateTripData('dates', range);
    if (range?.from && range?.to) {
      setIsSelecting(false);
    }
  };

  const isComplete = tripData.dates.from && tripData.dates.to;

  const footer = isComplete && (
    <div className="mt-3 flex items-center justify-center space-x-2">
      <Badge variant="outline" className="text-xs">
        {format(tripData.dates.from!, "MMM d")}
      </Badge>
      <ArrowRight className="w-3 h-3 text-muted-foreground" />
      <Badge variant="outline" className="text-xs">
        {format(tripData.dates.to!, "MMM d")}
      </Badge>
      <Badge variant="secondary" className="ml-2 text-xs">
        {Math.ceil(
          (tripData.dates.to!.getTime() - tripData.dates.from!.getTime()) / (1000 * 60 * 60 * 24)
        )}{" "}
        nights
      </Badge>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">When are you traveling?</h2>
      </div>

      <Card className="p-4">
        <div className="flex justify-center" onClick={handleCalendarClick}>
          <Calendar
            mode="range"
            selected={tripData.dates}
            onSelect={handleSelect}
            numberOfMonths={1}
            className="rounded-md border-0"
            defaultMonth={new Date()}
            fromDate={new Date()}
            footer={footer}
            weekStartsOn={1}
            classNames={{
              day_range_start: "rounded-l-md",
              day_range_end: "rounded-r-md",
              day_selected: "!bg-primary !text-primary-foreground hover:!bg-primary/90",
              day_today: "bg-accent text-accent-foreground",
              day_range_middle: "!bg-primary/10 !text-primary hover:!bg-primary/20",
              day: "h-9 w-9 text-center p-0 aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
            }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-2 bg-accent/50 rounded-lg">
          <span className="block text-xs font-medium">Departure Date</span>
          <span className="text-sm">
            {tripData.dates.from ? (
              format(tripData.dates.from, "EEE, MMM d")
            ) : (
              "Select date"
            )}
          </span>
        </div>
        <div className="p-2 bg-accent/50 rounded-lg">
          <span className="block text-xs font-medium">Return Date</span>
          <span className="text-sm">
            {tripData.dates.to ? (
              format(tripData.dates.to, "EEE, MMM d")
            ) : (
              "Select date"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}