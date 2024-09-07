import { capitalize } from './utils';
import type { Components } from './types';
import type { Registry } from './create-registry';
import { createRegisterItem, type RegisterItem } from './create-register-item';

type RegisterFns<TSlots extends string, TComponents extends Components> = {
	[K in keyof TComponents as `register${Capitalize<K & string>}`]: RegisterItem<
		TSlots,
		TComponents[K]
	>;
};

type AnyFunction = (...args: any[]) => any;

export function createRegisterFns<
	TSlots extends string,
	TComponents extends Components,
>(registry: Registry<TSlots>, components: TComponents) {
	const registerFns: Record<string, AnyFunction> = {};

	Object.entries(components).forEach(([key, component]) => {
		const name = `register${capitalize(key)}`;

		registerFns[name] = createRegisterItem(registry, component);
	});

	return registerFns as RegisterFns<TSlots, TComponents>;
}
