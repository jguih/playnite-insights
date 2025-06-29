export type ValidationResult<T> =
	| {
			isValid: false;
			message: string;
			httpCode: number;
			warnings?: string[];
			data?: undefined | T;
	  }
	| {
			isValid: true;
			message?: string;
			httpCode?: number;
			warnings?: string[];
			data: T;
	  };
