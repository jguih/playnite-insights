import type { IFetchClientStrategy } from './IFetchClientStrategy';

type BaseHttpProps<Output> = {
	endpoint?: string;
	strategy: IFetchClientStrategy<Output>;
} & Omit<RequestInit, 'method' | 'body'>;

export type HttpGetProps<Output> = BaseHttpProps<Output>;

export type HttpPostProps<Output> = BaseHttpProps<Output> & {
	body: object | FormData;
};

export type HttpDeleteProps<Output> = BaseHttpProps<Output>;

export type HttpPutProps<Output> = BaseHttpProps<Output> & {
	body?: RequestInit['body'];
};
