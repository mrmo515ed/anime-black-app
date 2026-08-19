/**
 * Anime Black - Premium Relative & Friendly Date/Time Formatter
 * Provides accurate, localized, and human-friendly timestamps for posts, comments, and interactions.
 */

export interface FormattedDateResult {
  relative: string;      // e.g. "منذ 15 دقيقة" or "15m ago"
  displayDate: string;   // e.g. "17 أغسطس • 09:30 م" or "Aug 17 • 9:30 PM"
  timeOnly: string;      // e.g. "09:30 م" or "9:30 PM"
  fullDateTime: string;  // Detailed tooltip string
  isRecent: boolean;     // Posted within last 24h
  badgeType: "live" | "today" | "yesterday" | "past";
}

export function formatFriendlyDate(
  rawDate: string | number | Date | null | undefined,
  isArabic: boolean = true
): FormattedDateResult {
  if (!rawDate) {
    return {
      relative: isArabic ? "الآن" : "Just now",
      displayDate: isArabic ? "اليوم" : "Today",
      timeOnly: "--:--",
      fullDateTime: isArabic ? "تاريخ غير محدد" : "Unknown date",
      isRecent: true,
      badgeType: "live"
    };
  }

  let dateObj: Date;
  try {
    dateObj = rawDate instanceof Date ? rawDate : new Date(rawDate);
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date");
    }
  } catch {
    return {
      relative: isArabic ? "الآن" : "Just now",
      displayDate: isArabic ? "اليوم" : "Today",
      timeOnly: "--:--",
      fullDateTime: isArabic ? "تاريخ غير محدد" : "Unknown date",
      isRecent: true,
      badgeType: "live"
    };
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Time-only string (e.g. 04:30 م or 4:30 PM)
  const timeOnly = dateObj.toLocaleTimeString(isArabic ? "ar-EG" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  // Full detailed string for tooltip
  const fullDateTime = dateObj.toLocaleString(isArabic ? "ar-EG" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  let relative = "";
  let displayDate = "";
  let badgeType: "live" | "today" | "yesterday" | "past" = "past";
  const isRecent = diffHours < 24;

  if (diffSec < 60) {
    relative = isArabic ? "الآن" : "Just now";
    displayDate = isArabic ? "الآن" : "Just now";
    badgeType = "live";
  } else if (diffMin < 60) {
    badgeType = "live";
    if (isArabic) {
      if (diffMin === 1) relative = "منذ دقيقة";
      else if (diffMin === 2) relative = "منذ دقيقتين";
      else if (diffMin >= 3 && diffMin <= 10) relative = `منذ ${diffMin} دقائق`;
      else relative = `منذ ${diffMin} دقيقة`;
      displayDate = relative;
    } else {
      relative = `${diffMin}m ago`;
      displayDate = `${diffMin} min ago`;
    }
  } else if (diffHours < 24) {
    badgeType = "today";
    if (isArabic) {
      if (diffHours === 1) relative = "منذ ساعة";
      else if (diffHours === 2) relative = "منذ ساعتين";
      else if (diffHours >= 3 && diffHours <= 10) relative = `منذ ${diffHours} ساعات`;
      else relative = `منذ ${diffHours} ساعة`;
      displayDate = `${relative} • ${timeOnly}`;
    } else {
      relative = `${diffHours}h ago`;
      displayDate = `${diffHours}h ago • ${timeOnly}`;
    }
  } else if (diffDays === 1) {
    badgeType = "yesterday";
    relative = isArabic ? `أمس في ${timeOnly}` : `Yesterday at ${timeOnly}`;
    displayDate = relative;
  } else if (diffDays < 7) {
    badgeType = "past";
    const dayName = dateObj.toLocaleDateString(isArabic ? "ar-EG" : "en-US", { weekday: "short" });
    relative = isArabic ? `${dayName} في ${timeOnly}` : `${dayName} at ${timeOnly}`;
    displayDate = isArabic ? `منذ ${diffDays} أيام • ${timeOnly}` : `${diffDays}d ago • ${timeOnly}`;
  } else {
    badgeType = "past";
    const isCurrentYear = dateObj.getFullYear() === now.getFullYear();
    const formattedCalendar = dateObj.toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
      ...(isCurrentYear ? {} : { year: "numeric" })
    });
    relative = `${formattedCalendar}`;
    displayDate = `${formattedCalendar} • ${timeOnly}`;
  }

  return {
    relative,
    displayDate,
    timeOnly,
    fullDateTime,
    isRecent,
    badgeType
  };
}
