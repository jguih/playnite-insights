export type ValidationResult<T = undefined> = {
  isValid: boolean;
  message: string;
  httpCode: number;
  warnings?: string[];
  data?: null | T;
};
