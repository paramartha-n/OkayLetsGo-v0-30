"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useTripContext } from "@/context/TripContext";

interface DateStepProps {
  onNext: () => void;
  onValidationChange?: (isValid: boolean) => void;
}

export default function DateStep({ onNext, onValidationChange }: DateStepProps) {
  const { tripData, updateTripData } = useTripContext();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleCalendarClick = () => {
    if (tripData.dates.from && tripData.dates.to && !isSelecting) {
      updateTripData('dates', { from: undefined, to: undefined });
      setIsSelecting(true);
      onValidationChange?.(false);
    }
  };

  const handleSelect = (range: DateRange | undefined) => {
    updateTripData('dates', range);
    if (range?.from && range?.to) {
      setIsSelecting(false);
      onValidationChange?.(true);
    } else {
      onValidationChange?.(false);
    }
  };

  useEffect(() => {
    onValidationChange?.(Boolean(tripData.dates.from && tripData.dates.to));
  }, []);

  const isComplete = tripData.dates.from && tripData.dates.to;

  const footer = isComplete && (
    <div className="mt-3 flex items-center justify-center space-x-2">
      <Badge variant="outline" className="text-xs border-okayletsgo-primary text-okayletsgo-primary">
        {format(tripData.dates.from!, "MMM d")}
      </Badge>
      <ArrowRight className="w-3 h-3 text-okayletsgo-primary" />
      <Badge variant="outline" className="text-xs border-okayletsgo-primary text-okayletsgo-primary">
        {format(tripData.dates.to!, "MMM d")}
      </Badge>
      <Badge className="ml-2 text-xs bg-okayletsgo-primary/20 text-okayletsgo-primary border-none">
        {Math.ceil(
          (tripData.dates.to!.getTime() - tripData.dates.from!.getTime()) / (1000 * 60 * 60 * 24)
        )}{" "}
        nights
      </Badge>
    </div>
  );

  return (
    <div className="min-h-[75vh] md:min-h-full md:h-[80vh] md:px-[20%] flex items-center">
      <div className="w-full">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold mb-2">When are you traveling?</h2>
        </div>

        <Card className="p-4 mb-6">
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
                day_selected: "!bg-okayletsgo-primary !text-white hover:!bg-okayletsgo-primary/90",
                day_today: "bg-gray-100 dark:bg-gray-800 text-foreground",
                day_range_middle: "!bg-okayletsgo-primary/10 !text-okayletsgo-primary hover:!bg-okayletsgo-primary/20",
                day: "h-9 w-9 text-center p-0 aria-selected:opacity-100 hover:bg-okayletsgo-primary/10 hover:text-okayletsgo-primary focus-visible:bg-okayletsgo-primary/10 focus-visible:text-okayletsgo-primary",
              }}
            />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-2 bg-okayletsgo-primary/10 rounded-lg">
            <span className="block text-xs font-medium text-okayletsgo-primary">Departure Date</span>
            <span className="text-sm">
              {tripData.dates.from ? (
                format(tripData.dates.from, "EEE, MMM d")
              ) : (
                "Select date"
              )}
            </span>
          </div>
          <div className="p-2 bg-okayletsgo-primary/10 rounded-lg">
            <span className="block text-xs font-medium text-okayletsgo-primary">Return Date</span>
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
    </div>
  );
}