import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  FileText,
  Briefcase,
  TrendingUp,
  Film,
  MoreHorizontal,
  Coffee,
  Home,
  HeartPulse,
  GraduationCap,
  Plane,
  Gift,
  Wallet,
  Tag,
  CreditCard,
  Smartphone,
  Landmark,
  Banknote
} from 'lucide-react';

interface CategoryIconProps {
  name?: string;
  iconName?: string;
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  Utensils,
  Car,
  ShoppingBag,
  FileText,
  Briefcase,
  TrendingUp,
  Film,
  MoreHorizontal,
  Coffee,
  Home,
  HeartPulse,
  GraduationCap,
  Plane,
  Gift,
  Wallet,
  Tag,
  CreditCard,
  Smartphone,
  Landmark,
  Banknote
};

// Fallback category mapping based on category names
const nameMap: Record<string, React.ElementType> = {
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: FileText,
  Salary: Briefcase,
  Business: TrendingUp,
  Entertainment: Film,
  Other: MoreHorizontal
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, iconName, className = 'w-5 h-5' }) => {
  // If iconName is an emoji character, render as text
  if (iconName && /\p{Extended_Pictographic}/u.test(iconName)) {
    return <span className="text-lg leading-none">{iconName}</span>;
  }

  // Look up by iconName first
  if (iconName && iconMap[iconName]) {
    const IconComponent = iconMap[iconName];
    return <IconComponent className={className} />;
  }

  // Look up by category name
  if (name && nameMap[name]) {
    const IconComponent = nameMap[name];
    return <IconComponent className={className} />;
  }

  // Fallback to Tag icon
  return <Tag className={className} />;
};
