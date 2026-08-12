import {
  BookOpen,
  Droplet,
  CloudRain,
  Sun,
  Moon,
  Heart,
  Brain,
  Coffee,
  Dumbbell,
  Footprints,
  PenTool,
  Smile,
  Star,
  TreePine,
  Wind,
  Circle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const HABIT_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Droplet,
  CloudRain,
  Sun,
  Moon,
  Heart,
  Brain,
  Coffee,
  Dumbbell,
  Footprints,
  PenTool,
  Smile,
  Star,
  TreePine,
  Wind,
  Circle,
};

// Resolves the lucide icon by name without tree-shake-killing barrel imports.
export function getHabitIcon(name: string): LucideIcon {
  return HABIT_ICONS[name] ?? Circle;
}