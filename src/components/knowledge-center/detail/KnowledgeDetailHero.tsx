'use client';

import React from 'react';
import Image from 'next/image';
import { Knowledge } from '@/types/knowledge-center';

interface KnowledgeDetailHeroProps {
  knowledge: Knowledge;
}

export default function KnowledgeDetailHero({ knowledge }: KnowledgeDetailHeroProps) {
  if (!knowledge.thumbnail) {
    return null;
  }

  return (
    <div className="relative h-64 md:h-96 lg:h-[500px]">
      <Image
        src={knowledge.thumbnail}
        alt={knowledge.title}
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}