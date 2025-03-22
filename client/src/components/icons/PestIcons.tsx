import React from 'react';

// Emoji components for different pest types
interface EmojiIconProps {
  className?: string;
  emoji: string;
}

const EmojiIcon: React.FC<EmojiIconProps> = ({ className = "text-2xl", emoji }) => (
  <span className={className} role="img" aria-label="Pest Icon">
    {emoji}
  </span>
);

export const StinkbugIcon: React.FC<{ className?: string; color?: string }> = ({ className }) => (
  <EmojiIcon emoji="🐞" className={className} />
);

export const CentipedeIcon: React.FC<{ className?: string; color?: string }> = ({ className }) => (
  <EmojiIcon emoji="🐛" className={className} />
);

export const MillipedeIcon: React.FC<{ className?: string; color?: string }> = ({ className }) => (
  <EmojiIcon emoji="🪱" className={className} />
);

export const BoxelderBugIcon: React.FC<{ className?: string; color?: string }> = ({ className }) => (
  <EmojiIcon emoji="🐜" className={className} />
);

export const AntIcon: React.FC<{ className?: string; color?: string }> = ({ className }) => (
  <EmojiIcon emoji="🐜" className={className} />
);

export const SpiderIcon: React.FC<{ className?: string; color?: string }> = ({ className }) => (
  <EmojiIcon emoji="🕷️" className={className} />
);

export const WaspIcon: React.FC<{ className?: string; color?: string }> = ({ className }) => (
  <EmojiIcon emoji="🐝" className={className} />
);

export const RodentIcon: React.FC<{ className?: string; color?: string }> = ({ className }) => (
  <EmojiIcon emoji="🐭" className={className} />
);

// Map of pest category names to icons
export const pestIcons: Record<string, React.FC<{ className?: string; color?: string }>> = {
  "Ants": AntIcon,
  "Spiders": SpiderIcon,
  "Wasps": WaspIcon,
  "Stinkbugs": StinkbugIcon,
  "Rodents": RodentIcon,
  "Centipedes": CentipedeIcon,
  "Millipedes": MillipedeIcon,
  "Boxelder Bugs": BoxelderBugIcon
};