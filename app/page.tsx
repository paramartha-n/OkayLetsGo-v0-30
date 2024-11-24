"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CityStep from "@/components/steps/CityStep";
import OriginCityStep from "@/components/steps/OriginCityStep";
import DateStep from "@/components/steps/DateStep";
import HotelStep from "@/components/steps/HotelStep";
import TransportStep from "@/components/steps/TransportStep";
import ActivityStep from "@/components/steps/ActivityStep";
import RestaurantStep from "@/components/steps/RestaurantStep";
import PreferencesStep from "@/components/steps/PreferencesStep";
import BudgetStep from "@/components/steps/BudgetStep";
import SummaryStep from "@/components/steps/SummaryStep";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TripProvider } from "@/context/TripContext";
import CurrencySelector from "@/components/CurrencySelector";
import Itinerary from "@/components/Itinerary";

const steps = [
  { id: 1, title: "Destination", component: CityStep },
  { id: 2, title: "Origin", component: OriginCityStep },
  { id: 3, title: "Dates", component: DateStep },
  { id: 4, title: "Hotel", component: HotelStep },
  { id: 5, title: "Transport", component: TransportStep },
  { id: 6, title: "Activities", component: ActivityStep },
  { id: 7, title: "Restaurants", component: RestaurantStep },
  { id: 8, title: "Preferences", component: PreferencesStep },
  { id: 9, title: "Budget", component: BudgetStep },
  { id: 10, title: "Summary", component: SummaryStep },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [accordionValue, setAccordionValue] = useState("step-form");
  const itineraryRef = useRef<HTMLDivElement>(null);
  const CurrentStepComponent = steps.find((step) => step.id === currentStep)?.component;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEditStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    setAccordionValue("step-form");
  };

  const handleCreateItinerary = () => {
    setAccordionValue("");
    setTimeout(() => {
      itineraryRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const showNavigation = currentStep !== 1 && currentStep !== 4 && currentStep !== steps.length;
  const showOnlyPrevious = currentStep === 4;

  return (
    <TripProvider>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="mx-auto px-4 w-full md:min-w-[960px] md:w-1/2 md:max-w-[1400px]">
          <div className="flex flex-col min-h-screen">
            <div className="flex justify-center space-x-2 py-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`w-8 h-1 rounded ${
                    step.id === currentStep
                      ? "bg-primary"
                      : step.id < currentStep
                      ? "bg-primary/60"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            <Accordion 
              type="single" 
              collapsible 
              value={accordionValue}
              onValueChange={setAccordionValue}
              className="flex-1"
            >
              <AccordionItem value="step-form" className="border-none">
                <AccordionTrigger className="py-2">
                  <span className="text-lg font-semibold">
                    {steps.find((step) => step.id === currentStep)?.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="p-6">
                    <div className="flex justify-end mb-4">
                      <CurrencySelector />
                    </div>

                    <div className="scale-[0.95] origin-top">
                      {CurrentStepComponent && (
                        <CurrentStepComponent 
                          onNext={handleNext} 
                          isFirstStep={currentStep === 1}
                          onEdit={handleEditStep}
                          onCreateItinerary={handleCreateItinerary}
                        />
                      )}

                      {showNavigation && (
                        <div className="flex justify-between mt-6">
                          <Button
                            variant="outline"
                            onClick={handlePrevious}
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                          </Button>
                          <Button onClick={handleNext}>
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}

                      {showOnlyPrevious && (
                        <div className="flex mt-6">
                          <Button
                            variant="outline"
                            onClick={handlePrevious}
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div ref={itineraryRef} className="py-6">
              <Itinerary />
            </div>
          </div>
        </div>
      </main>
    </TripProvider>
  );
}