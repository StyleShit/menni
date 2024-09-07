import type { Registry } from './create-registry';

export function createUnregister<TSlots extends string>(
	registry: Registry<TSlots>,
) {
	return (id: string) => {
		registry.slots.forEach((slot) => {
			slot.delete(id);
		});

		registry.notify();
	};
}
