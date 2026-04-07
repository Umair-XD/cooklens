'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
}

interface StepListProps {
  steps: RecipeStep[];
}

export function StepList({ steps }: StepListProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  };

  if (steps.length === 0) {
    return <p className="text-sm text-muted-foreground">No steps available.</p>;
  }

  const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);

  return (
    <ol className="space-y-4">
      {sortedSteps.map((step) => {
        const isCompleted = completedSteps.has(step.stepNumber);
        return (
          <li
            key={step.stepNumber}
            className="flex items-start gap-3 rounded-lg border p-4 transition-colors"
          >
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => toggleStep(step.stepNumber)}
              aria-label={`Mark step ${step.stepNumber} as complete`}
              className="mt-0.5 shrink-0"
            />
            <div className="flex-1">
              <span
                className={cn(
                  'text-sm leading-relaxed',
                  isCompleted && 'text-muted-foreground line-through'
                )}
              >
                <span className="font-semibold mr-1">Step {step.stepNumber}.</span>
                {step.instruction}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
