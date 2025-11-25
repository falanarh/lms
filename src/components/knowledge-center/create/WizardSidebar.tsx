'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface WizardSidebarProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export default function WizardSidebar({ steps, currentStep, onStepClick }: WizardSidebarProps) {
  return (
    <div className="w-80 border-r border-[var(--border,rgba(0,0,0,0.12))]/50 min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50/40 to-blue-50/30">
      <div className="mb-12">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent mb-1">
          Create Knowledge
        </h1>
        <p className="text-sm text-gray-600">Share your expertise</p>
      </div>

      {/* Vertical Steps */}
      <div className="space-y-1">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative">
              <button
                onClick={() => {
                  if (isCompleted) {
                    onStepClick(step.id);
                  }
                }}
                disabled={!isCompleted && !isActive}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : isCompleted
                    ? 'bg-white text-gray-900 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 cursor-pointer border border-green-200/50'
                    : 'bg-transparent text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? 'bg-white text-blue-600'
                        : isCompleted
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold mb-0.5 ${
                        isActive
                          ? 'text-white'
                          : isCompleted
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p
                      className={`text-xs ${
                        isActive
                          ? 'text-blue-100'
                          : isCompleted
                          ? 'text-gray-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`ml-7 h-2 w-px ${
                    isCompleted ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress percentage */}
      <div className="mt-8 pt-8 border-t border-[var(--border,rgba(0,0,0,0.12))]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-semibold text-blue-600">
            {Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}