import React from "react";
import { getLevelBadgeInfo } from "../utils/levelBadgeSystem";
import { Shield, Sparkles, Award } from "lucide-react";

interface LevelBadgeProps {
  level: number;
  size?: "xs" | "sm" | "md" | "lg";
  showTitle?: boolean;
  showIcon?: boolean;
  className?: string;
  onClick?: () => void;
  isArabic?: boolean;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level = 1,
  size = "sm",
  showTitle = false,
  showIcon = true,
  className = "",
  onClick,
  isArabic = true,
}) => {
  const badgeInfo = getLevelBadgeInfo(level);

  // Size styles
  let sizeClasses = "px-2 py-0.5 text-[10px] gap-1";
  let iconSize = "w-3 h-3";

  if (size === "xs") {
    sizeClasses = "px-1.5 py-[1px] text-[9px] gap-0.5";
    iconSize = "w-2.5 h-2.5";
  } else if (size === "md") {
    sizeClasses = "px-2.5 py-1 text-xs gap-1.5";
    iconSize = "w-3.5 h-3.5";
  } else if (size === "lg") {
    sizeClasses = "px-3 py-1.5 text-sm gap-2 font-black";
    iconSize = "w-4 h-4";
  }

  // Ultra glowing effect for level 50+ / 80+ / 100
  const isHighLevel = badgeInfo.level >= 50;
  const isGodLevel = badgeInfo.level >= 90;

  return (
    <span
      onClick={onClick}
      title={`${badgeInfo.titleAr} - ${badgeInfo.titleEn}`}
      style={{
        boxShadow: isHighLevel ? `0 0 10px ${badgeInfo.glowColor}` : "none",
        borderColor: badgeInfo.borderColor,
      }}
      className={`inline-flex items-center align-middle rounded-full font-mono font-bold tracking-tight text-white border bg-gradient-to-r ${badgeInfo.badgeBg} ${sizeClasses} ${
        onClick ? "cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md" : ""
      } ${isGodLevel ? "animate-pulse" : ""} ${className}`}
    >
      {showIcon && (
        <span className="leading-none flex-shrink-0">
          {badgeInfo.icon ? badgeInfo.icon : <Award className={`${iconSize} text-white`} />}
        </span>
      )}
      <span>Lv.{badgeInfo.level}</span>
      {showTitle && (
        <span className="truncate max-w-[120px] font-sans text-[0.9em] border-r border-white/20 pr-1 mr-0.5 font-extrabold">
          {isArabic ? badgeInfo.titleAr : badgeInfo.titleEn}
        </span>
      )}
    </span>
  );
};

export default LevelBadge;
