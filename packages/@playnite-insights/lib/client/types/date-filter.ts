export type DateFilter =
  | { op: "between"; start: string; end: string }
  | { op: "gte"; value: string }
  | { op: "lte"; value: string }
  | { op: "eq"; value: string }
  | { op: "overlaps"; start: string; end: string };
