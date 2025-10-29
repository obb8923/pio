import { useState, useMemo } from 'react';
import { DictionaryColumns } from '@libs/supabase/operations/dictionary/type';

const SEASON_LABELS = ["봄", "여름", "가을", "겨울"];

export const useSeasonSections = (dictionary: DictionaryColumns[] | null) => {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({ 
    0: true, 1: true, 2: true, 3: true 
  });

  const toggleSection = (idx: number) => {
    setOpenSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const sections = useMemo(() => {
    if (!dictionary) return [];
    
    const seasonGroups: Record<number, DictionaryColumns[]> = {
      0: [], 1: [], 2: [], 3: []
    };
    
    dictionary.forEach((item) => {
      if (Array.isArray(item.season)) {
        item.season.forEach((isInSeason: boolean, idx: number) => {
          if (isInSeason) {
            seasonGroups[idx].push(item);
          }
        });
      }
    });
    
    return SEASON_LABELS.map((label, idx) => ({
      title: label,
      idx,
      data: openSections[idx] ? [seasonGroups[idx]] : [],
    })).filter((section) => seasonGroups[section.idx].length > 0);
  }, [dictionary, openSections]);

  return {
    sections,
    toggleSection,
    openSections
  };
};
