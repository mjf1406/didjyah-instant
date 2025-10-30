import { clsx, type ClassValue } from "clsx"
import { v4 as uuidv4 } from "uuid";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUuidWithPrefix(prefix: string){
  "use client"
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return `${prefix}${uuidv4()}`
}

export function formatDate(input: string): string {
  const date = new Date(input);

  // Get individual date parts and pad them if necessary
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}