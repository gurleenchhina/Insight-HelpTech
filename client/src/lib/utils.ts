import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Cleanup and format text from AI responses 
 */
export function cleanupText(text: string | undefined): string {
  if (!text) return '';
  
  // Remove JSON formatting symbols, brackets, quotes, etc.
  let cleaned = text
    .replace(/[{}[\]"]+/g, '') // Remove brackets and quotes
    .replace(/\\n/g, ' ') // Replace escaped newlines with spaces
    .replace(/\\/g, '') // Remove backslashes
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
    .replace(/boxed|recommendation:|pestType:|products:|applicationAdvice:|primary:|alternative:/gi, '') // Remove field labels
    .replace(/^\s*[-*•:]+\s*/gm, '') // Remove bullet points at the start of lines
    .trim();
  
  // Capitalize the first letter if it's not already capitalized
  if (cleaned.length > 0 && cleaned[0] === cleaned[0].toLowerCase()) {
    cleaned = cleaned[0].toUpperCase() + cleaned.slice(1);
  }
  
  // Add a period at the end if there isn't one already
  if (cleaned.length > 0 && !cleaned.match(/[.!?]$/)) {
    cleaned += '.';
  }
  
  return cleaned;
}
