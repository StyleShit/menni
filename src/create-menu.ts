import type { Components } from './types';
import { createRegistry } from './create-registry';
import { createUnregister } from './create-unregister';
import { createRegisterFns } from './create-register-fns';
import { createUseSlotItems } from './create-use-slot-items';

export function createMenu<
	TComponents extends Components,
	TSlots extends string = 'default',
>(args: { slots?: TSlots[]; components: TComponents }) {
	const registry = createRegistry<TSlots>();
	const registerFns = createRegisterFns(registry, args.components);
	const useSlotItems = createUseSlotItems(registry);
	const unregister = createUnregister(registry);

	return {
		useSlotItems,
		unregister,
		...registerFns,
	};
}
