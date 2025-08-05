import { useEffect, useReducer, type ComponentType } from 'react';
import type { Registry } from './create-registry';

export type UseSlotItems<TSlots extends string> = (
	slot?: TSlots | 'default',
	options?: {
		reactive?: boolean;
	},
) => Array<{
	id: string;
	MenuItem: ComponentType;
}>;

export function createUseSlotItems<TSlots extends string>(
	registry: Registry<TSlots>,
): UseSlotItems<TSlots> {
	return (slot = 'default', { reactive = true } = {}) => {
		const [, reRender] = useReducer((p) => !p, false);

		useEffect(() => {
			return registry.subscribe(slot, () => {
				if (reactive) {
					reRender();
				}
			});
		}, [slot]);

		const items = registry.slots.get(slot);

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
