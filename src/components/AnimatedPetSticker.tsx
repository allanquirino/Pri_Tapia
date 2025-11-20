import { PawPrint, Heart, Star } from "lucide-react";
import { ReactNode } from "react";

interface AnimatedPetStickerProps {
  children: ReactNode;
  variant?: "paw" | "heart" | "star";
  color?: "pink" | "blue" | "yellow" | "green" | "purple";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorClasses = {
  pink: "border-pink-400 shadow-pink-200",
  blue: "border-blue-400 shadow-blue-200",
  yellow: "border-yellow-400 shadow-yellow-200",
  green: "border-green-400 shadow-green-200",
  purple: "border-purple-400 shadow-purple-200",
};

const sizeClasses = {
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export const AnimatedPetSticker = ({
  children,
  variant = "paw",
  color = "pink",
  size = "md",
  className = ""
}: AnimatedPetStickerProps) => {
  const IconComponent = variant === "paw" ? PawPrint : variant === "heart" ? Heart : Star;

  return (
    <div className={`relative group ${className}`}>
      {/* Animated border with gradient */}
      <div className={`
        relative rounded-lg border-2 ${colorClasses[color]}
        bg-gradient-to-br from-white to-gray-50
        shadow-lg transform transition-all duration-300
        hover:scale-105 hover:shadow-xl
        before:absolute before:inset-0 before:rounded-lg
        before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
        before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
        ${sizeClasses[size]}
      `}>
        {/* Anime-style sparkle effects */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-pink-300 rounded-full animate-pulse"></div>

        {/* Content */}
        {children}

        {/* Paw print icon in bottom right */}
        <div className={`
          absolute bottom-1 right-1 ${colorClasses[color].split(' ')[0].replace('border-', 'bg-')}
          rounded-full p-1 shadow-md transform transition-transform duration-300
          group-hover:rotate-12 group-hover:scale-110
        `}>
          <IconComponent className={`${iconSizes[size]} text-white drop-shadow-sm`} />
        </div>

        {/* Floating particles animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <div className="absolute top-2 left-2 w-1 h-1 bg-pink-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-4 right-3 w-0.5 h-0.5 bg-blue-400 rounded-full animate-bounce opacity-50" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-3 left-4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce opacity-70" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Glow effect on hover */}
      <div className={`
        absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300
        ${colorClasses[color].split(' ')[0].replace('border-', 'bg-')} blur-xl -z-10
      `}></div>
    </div>
  );
};