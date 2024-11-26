"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Wallet, CreditCard, BadgeDollarSign, Coins } from "lucide-react";
import { useTripContext } from "@/context/TripContext";

const budgetRanges = [
  {
    id: "budget",
    icon: <Coins className="w-4 h-4" />,
    title: "Budget",
    description: "Cost-conscious",
    range: "Under €300",
    typical: "Basic amenities",
    label: "Budget"
  },
  {
    id: "moderate",
    icon: <BadgeDollarSign className="w-4 h-4" />,
    title: "Moderate",
    description: "Mid-range options",
    range: "€300 - €600",
    typical: "Good value",
    label: "Moderate"
  },
  {
    id: "comfort",
    icon: <Wallet className="w-4 h-4" />,
    title: "Comfort",
    description: "Quality experience",
    range: "€600 - €1,500",
    typical: "Extra comfort",
    label: "Comfort"
  },
  {
    id: "luxury",
    icon: <CreditCard className="w-4 h-4" />,
    title: "Luxury",
    description: "No expense spared",
    range: "Over €1,500",
    typical: "Premium service",
    label: "Luxury"
  },
];

interface BudgetStepProps {
  onNext: () => void;
}

export default function BudgetStep({ onNext }: BudgetStepProps) {
  const { tripData, updateTripData } = useTripContext();

  const handleSelect = (value: string) => {
    const selectedBudget = budgetRanges.find(budget => budget.id === value);
    updateTripData('budget', selectedBudget?.range || '');
    onNext();
  };

  const getSelectedId = () => {
    return budgetRanges.find(budget => budget.range === tripData.budget)?.id || '';
  };

  return (
    <div className="min-h-[75vh] md:min-h-full md:h-[80vh] md:px-[20%] flex items-center">
      <div className="w-full">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold mb-2">What's your ideal total budget for this entire trip?</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {budgetRanges.map((option) => (
            <Card
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`cursor-pointer transition-all duration-200 ${
                getSelectedId() === option.id
                  ? "border-okayletsgo-primary bg-okayletsgo-primary/5 dark:bg-okayletsgo-primary/10"
                  : "hover:bg-okayletsgo-primary/5"
              }`}
            >
              <CardContent className="p-2 sm:p-4">
                <div className="flex items-start justify-end space-x-2 sm:space-x-3">
                  <div className="flex-1 flex flex-col items-end space-y-1">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2 w-full">
                      <Label 
                        className={`font-bold text-[11px] sm:text-base truncate text-right ${
                          getSelectedId() === option.id
                            ? "text-okayletsgo-primary"
                            : ""
                        }`}
                      >
                        {option.label}
                      </Label>
                      <div className={`p-1.5 sm:p-2 rounded-full ${
                        getSelectedId() === option.id
                          ? "bg-okayletsgo-primary/20 text-okayletsgo-primary dark:bg-okayletsgo-primary/30"
                          : "bg-okayletsgo-primary/10 text-okayletsgo-primary"
                      }`}>
                        {option.icon}
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-right">
                      {option.description}
                    </p>
                    <div className={`inline-block px-2 py-1 mt-1 text-[10px] sm:text-xs rounded-full text-center ${
                      getSelectedId() === option.id
                        ? "bg-okayletsgo-primary/20 text-okayletsgo-primary dark:bg-okayletsgo-primary/30"
                        : "bg-okayletsgo-primary/10 text-okayletsgo-primary"
                    }`}>
                      {option.range}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}