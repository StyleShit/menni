import type { Registry } from './create-registry';

export function createUnregister<TSlots extends string>(
	registry: Registry<TSlots>,
) {
	return (id: string) => {
		for (const [slotName, slotItems] of registry.slots.entries()) {
			slotItems.delete(id);

			registry.notify(slotName);

			break;
		}
	};
}
