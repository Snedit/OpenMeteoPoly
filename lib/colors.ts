import { ColorRule } from './store';

export function getColorForValue(value: number, rules: ColorRule[]): string {
  // Sort rules by min value to ensure proper ordering
  const sortedRules = [...rules].sort((a, b) => a.min - b.min);
  
  for (const rule of sortedRules) {
    if (value >= rule.min && value < rule.max) {
      return rule.color;
    }
  }
  
  // If no rule matches, return the last rule's color
  return sortedRules[sortedRules.length - 1]?.color || '#6b7280';
}

export function hexToRgba(hex: string, alpha: number = 0.6): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const predefinedColors = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e', // Rose
];