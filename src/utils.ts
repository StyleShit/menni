export function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function debounce<TArgs extends any[]>(
	fn: (...args: TArgs) => void,
	ms: number,
) {
	let timeout: ReturnType<typeof setTimeout>;

	return (...args: TArgs) => {
		clearTimeout(timeout);

		timeout = setTimeout(() => {
			fn(...args);
		}, ms);
	};
}
