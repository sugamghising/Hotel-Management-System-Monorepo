"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = ["Dates", "Room & Rate", "Guest", "Guarantee", "Review"] as const;

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="hidden sm:flex items-center justify-between">
        {STEPS.map((label, index) => {
          const step = index + 1;
          const isCompleted = completedSteps.includes(step);
          const isCurrent = currentStep === step;
          const isFuture = step > currentStep && !isCompleted;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => {
                  if (isCompleted || isCurrent) onStepClick(step);
                }}
                disabled={isFuture}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors",
                  isFuture && "cursor-not-allowed",
                  (isCompleted || isCurrent) && "cursor-pointer",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-semibold shrink-0",
                    isCompleted &&
                      "bg-primary border-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary text-primary bg-primary/10",
                    isFuture && "border-muted-foreground/30 text-muted-foreground/50",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step
                  )}
                </span>
                <span
                  className={cn(
                    "hidden md:inline font-medium",
                    isCurrent && "text-foreground",
                    isCompleted && "text-muted-foreground",
                    isFuture && "text-muted-foreground/50",
                  )}
                >
                  {label}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px mx-4",
                    completedSteps.includes(step)
                      ? "bg-primary"
                      : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="sm:hidden text-sm text-muted-foreground text-center">
        Step {currentStep} of {STEPS.length}:{" "}
        <span className="font-medium text-foreground">
          {STEPS[currentStep - 1]}
        </span>
      </div>
    </div>
  );
}
