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
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { TripProvider } from "@/context/TripContext";
import CurrencySelector from "@/components/CurrencySelector";
import Itinerary from "@/components/Itinerary";

const steps = [
  { id: 1, component: CityStep },
  { id: 2, component: OriginCityStep },
  { id: 3, component: DateStep },
  { id: 4, component: HotelStep },
  { id: 5, component: ActivityStep },
  { id: 6, component: RestaurantStep },
  { id: 7, component: TransportStep },
  { id: 8, component: BudgetStep },
  { id: 9, component: PreferencesStep },
  { id: 10, component: SummaryStep },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [accordionValue, setAccordionValue] = useState("step-form");
  const [isStepValid, setIsStepValid] = useState(true);
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

  const showNavigation = currentStep !== 1 && currentStep !== 4 && currentStep !== steps.length && currentStep !== 8;
  const showOnlyPrevious = currentStep === 4 || currentStep === 8;
  const isActivityStep = currentStep === 5;
  const isRestaurantStep = currentStep === 6;
  const isTransportStep = currentStep === 7;
  const isDateStep = currentStep === 3;
  const needsValidation = isActivityStep || isRestaurantStep || isTransportStep || isDateStep;

  return (
    <TripProvider>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="mx-auto px-4 w-full md:min-w-[960px] md:w-1/2 md:max-w-[1400px]">
          <div className="flex flex-col min-h-screen">
            <Accordion 
              type="single" 
              collapsible 
              value={accordionValue}
              onValueChange={setAccordionValue}
              className="flex-1"
            >
              <AccordionItem value="step-form" className="border-none">
                <AccordionTrigger className="py-4 w-full">
                  <div className="flex flex-col w-full gap-3">
                    <div className="flex justify-center space-x-2">
                      {steps.map((step) => (
                        <div
                          key={step.id}
                          className={`w-8 h-1 rounded transition-colors ${
                            step.id === currentStep
                              ? "bg-primary"
                              : step.id < currentStep
                              ? "bg-primary/60"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="p-6">
                    <div className="scale-[0.95] origin-top">
                      {CurrentStepComponent && (
                        <CurrentStepComponent 
                          onNext={handleNext} 
                          isFirstStep={currentStep === 1}
                          onEdit={handleEditStep}
                          onCreateItinerary={handleCreateItinerary}
                          onValidationChange={needsValidation ? setIsStepValid : undefined}
                        />
                      )}

                      {showNavigation && (
                        <div className="flex justify-between mt-6">
                          <Button
                            variant="outline"
                            onClick={handlePrevious}
                            className="w-[20%] md:w-[15%]"
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </Button>
                          <Button 
                            onClick={handleNext} 
                            className="w-[20%] md:w-[15%]"
                            disabled={needsValidation && !isStepValid}
                          >
                            <ArrowRight className="w-5 h-5" />
                          </Button>
                        </div>
                      )}

                      {showOnlyPrevious && (
                        <div className="flex mt-6">
                          <Button
                            variant="outline"
                            onClick={handlePrevious}
                            className="w-[20%] md:w-[15%]"
                          >
                            <ArrowLeft className="w-5 h-5" />
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