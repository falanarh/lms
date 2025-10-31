'use client';

import { ChevronDown } from "lucide-react";

export type FAQItemType = {
  id: number | string;
  question: string;
  answer: string;
  category?: string;
};

type FAQItemProps = {
  faq: FAQItemType;
  isOpen?: boolean;
  onToggle?: () => void;
};

export function FAQItem({ faq, isOpen = false, onToggle }: FAQItemProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left transition-colors hover:bg-gray-50"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-900 text-lg flex-1">
          {faq.question}
        </span>
        <ChevronDown
          size={24}
          className={`text-blue-600 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-5 pt-2">
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}