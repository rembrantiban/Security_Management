/** Segmented control container and segments (e.g. tab switches in the header). */
export const HEADER_SEGMENTED = "inline-flex items-center gap-0.5 rounded-md border border-stone-300 bg-white p-0.5";
export const headerSegment = (active: boolean) =>
  `rounded-[5px] px-3 py-1.5 text-[12.5px] font-medium capitalize transition-colors ${
    active ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
  }`;
