import { useEffect, useReducer, type ComponentType } from 'react';
import type { Registry } from './create-registry';

export type UseSlotItems<TSlots extends string> = (
	slot?: TSlots | 'default',
) => Array<{
	id: string;
	MenuItem: ComponentType;
}>;

export function createUseSlotItems<TSlots extends string>(
	registry: Registry<TSlots>,
): UseSlotItems<TSlots> {
	return (slot = 'default') => {
		const [, reRender] = useReducer((p) => !p, false);

		useEffect(() => {
			return registry.subscribe(reRender);
		}, [slot]);

		const items = registry.items.get(slot);

		if (!items) {
			return [];
		}

		return [...items.values()]
			.sort((a, b) => a.priority - b.priority)
			.map(({ id, component }) => ({
				id,
				MenuItem: component,
			}));
	};
}
