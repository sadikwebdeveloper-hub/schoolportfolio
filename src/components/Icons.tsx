import React from "react";
import * as LucideIcons from "lucide-react";

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export function DynamicIcon({ name, className = "", size = 24 }: IconProps) {
  // Resolve icon component dynamically
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) {
    // Fallback icon if not found
    return <LucideIcons.HelpCircle className={className} size={size} />;
  }
  return <IconComponent className={className} size={size} />;
}
