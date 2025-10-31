'use client';

import { useState } from "react";
import { FAQItem, type FAQItemType } from "./FaqItem";

type FAQListProps = {
  faqs: FAQItemType[];
  allowMultipleOpen?: boolean;
};

export function FAQList({ faqs, allowMultipleOpen = false }: FAQListProps) {
  const [openItems, setOpenItems] = useState<Set<number | string>>(new Set());

  const handleToggle = (id: number | string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      
      if (allowMultipleOpen) {
        // Allow multiple items to be open
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        // Only one item can be open at a time
        if (newSet.has(id)) {
          newSet.clear();
        } else {
          newSet.clear();
          newSet.add(id);
        }
      }
      
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <FAQItem
          key={faq.id}
          faq={faq}
          isOpen={openItems.has(faq.id)}
          onToggle={() => handleToggle(faq.id)}
        />
      ))}
    </div>
  );
}