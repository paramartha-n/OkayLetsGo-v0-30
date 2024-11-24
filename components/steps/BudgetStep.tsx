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
  },
  {
    id: "moderate",
    icon: <BadgeDollarSign className="w-4 h-4" />,
    title: "Moderate",
    description: "Mid-range options",
    range: "€300 - €600",
    typical: "Good value",
  },
  {
    id: "comfort",
    icon: <Wallet className="w-4 h-4" />,
    title: "Comfort",
    description: "Quality experience",
    range: "€600 - €1,500",
    typical: "Extra comfort",
  },
  {
    id: "luxury",
    icon: <CreditCard className="w-4 h-4" />,
    title: "Luxury",
    description: "No expense spared",
    range: "Over €1,500",
    typical: "Premium service",
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
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">What's your ideal total budget for this entire trip?</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {budgetRanges.map((option) => (
          <Card
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`cursor-pointer transition-all duration-200 ${
              getSelectedId() === option.id
                ? "border-traveloka-primary bg-traveloka-primary/5 dark:bg-traveloka-primary/10"
                : "hover:bg-traveloka-primary/5"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${
                      getSelectedId() === option.id
                        ? "bg-traveloka-primary/20 text-traveloka-primary dark:bg-traveloka-primary/30"
                        : "bg-traveloka-primary/10 text-traveloka-primary"
                    }`}>
                      {option.icon}
                    </div>
                    <Label 
                      className={`font-medium ${
                        getSelectedId() === option.id
                          ? "text-traveloka-primary"
                          : ""
                      }`}
                    >
                      {option.title}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                  <div className={`inline-block px-2 py-1 mt-1 text-xs rounded-full ${
                    getSelectedId() === option.id
                      ? "bg-traveloka-primary/20 text-traveloka-primary dark:bg-traveloka-primary/30"
                      : "bg-traveloka-primary/10 text-traveloka-primary"
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
  );
}