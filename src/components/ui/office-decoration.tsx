import React from 'react';
import { cn } from '../../lib/utils';
import {
  StickyNote,
  PenTool,
  Laptop,
  Smartphone,
  Calendar,
  Clipboard,
  Paperclip,
  BookOpen,
  Briefcase,
  FileText,
  Pen,
  Ruler,
  Scissors
} from 'lucide-react';

export type OfficeIconType =
  | 'sticky'
  | 'pen'
  | 'laptop'
  | 'phone'
  | 'calendar'
  | 'clipboard'
  | 'paperclip'
  | 'book'
  | 'briefcase'
  | 'file'
  | 'ruler'
  | 'scissors'
  | 'pencil';

interface OfficeDecorationProps {
  type?: OfficeIconType;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  size?: 'sm' | 'md' | 'lg';
  opacity?: number;
  className?: string;
  color?: string;
}

const iconMap = {
  sticky: StickyNote,
  pen: PenTool,
  laptop: Laptop,
  phone: Smartphone,
  calendar: Calendar,
  clipboard: Clipboard,
  paperclip: Paperclip,
  book: BookOpen,
  briefcase: Briefcase,
  file: FileText,
  ruler: Ruler,
  scissors: Scissors,
  pencil: Pen,
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const positionClasses = {
  'top-right': 'absolute -top-3 -right-3',
  'bottom-right': 'absolute -bottom-3 -right-3',
  'top-left': 'absolute -top-3 -left-3',
  'bottom-left': 'absolute -bottom-3 -left-3',
};

export function OfficeDecoration({
  type = 'sticky',
  position = 'top-right',
  size = 'md',
  opacity = 0.6,
  className,
  color
}: OfficeDecorationProps) {
  const Icon = iconMap[type] || StickyNote;

  return (
    <div
      className={cn(
        positionClasses[position],
        'flex items-center justify-center rounded-xl',
        'transform transition-transform group-hover:scale-110',
        'filter drop-shadow-md',
        className
      )}
      style={{
        opacity,
        color: color || undefined
      }}
    >
      <Icon className={cn(sizeClasses[size])} />
    </div>
  );
}

// Decorative elements that can be randomly placed
export function OfficeDecorations({
  items = 2,
  color,
  className
}: {
  items?: number;
  color?: string;
  className?: string;
}) {
  // Available decoration combinations
  const decorationSets: OfficeIconType[][] = [
    ['sticky', 'pen'],
    ['pencil', 'scissors'],
    ['clipboard', 'ruler'],
    ['paperclip', 'file'],
    ['book', 'briefcase'],
    ['phone', 'calendar'],
  ];

  const positions: ('top-right' | 'bottom-right' | 'top-left' | 'bottom-left')[] = [
    'top-right', 'bottom-right', 'top-left', 'bottom-left'
  ];

  // Pick a random decoration set
  const randomSet = decorationSets[Math.floor(Math.random() * decorationSets.length)];
  const selectedIcons = randomSet.slice(0, items);
  const usedPositions = new Set<keyof typeof positionClasses>();

  return (
    <div className={cn("relative w-full h-full", className)}>
      {selectedIcons.map((icon, index) => {
        // Find an unused position
        let positionIndex = index % positions.length;
        const position = positions[positionIndex];
        usedPositions.add(position);

        return (
          <OfficeDecoration
            key={icon}
            type={icon}
            position={position}
            size="sm"
            opacity={0.5 - (index * 0.1)}
            color={color}
          />
        );
      })}
    </div>
  );
}

// Corner decoration for cards
export function CardCornerDecoration({
  icon = 'sticky',
  color = '#FFB7B2'
}: {
  icon?: OfficeIconType;
  color?: string;
}) {
  return (
    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
      <div
        className="absolute top-0 right-0 w-16 h-16 transform rotate-45 translate-x-8 -translate-y-8 opacity-20"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
