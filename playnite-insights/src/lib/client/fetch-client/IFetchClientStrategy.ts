export interface IFetchClientStrategy<Output = null> {
	handleAsync: (response: Response) => Promise<Output | null>;
}
