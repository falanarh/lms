'use client';

import React from 'react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface WizardHeaderProps {
  steps: Step[];
  currentStep: number;
}

export default function WizardHeader({ steps, currentStep }: WizardHeaderProps) {
  return (
    <div className="border-b border-[var(--border,rgba(0,0,0,0.12))] px-8 py-6 bg-white">
      <div className="max-w-4xl">
        <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
          <span className="font-medium">Step {currentStep}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-600">{steps[currentStep - 1].title}</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          {steps[currentStep - 1].description}
        </h2>
      </div>
    </div>
  );
}