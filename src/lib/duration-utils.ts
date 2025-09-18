/**
 * Utility functions for handling duration formatting
 */

export const formatDuration = (minutes: number, customText?: string): string => {
  if (customText) return customText;
  
  if (minutes <= 0) return '0 menit';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} jam ${remainingMinutes} menit`;
  } else if (hours > 0) {
    return `${hours} jam`;
  } else {
    return `${remainingMinutes} menit`;
  }
};

export const formatDurationCompact = (minutes: number, customText?: string): string => {
  if (customText) return customText;
  
  if (minutes <= 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}j ${remainingMinutes}m`;
  } else if (hours > 0) {
    return `${hours}j`;
  } else {
    return `${remainingMinutes}m`;
  }
};

export const generateDurationText = (minutes: number): string => {
  return formatDuration(minutes);
};