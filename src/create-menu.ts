import type { Components } from './types';
import { createRegistry } from './create-registry';
import { createRegisterFns } from './create-register-fns';
import { createUseSlotItems } from './create-use-slot-items';

export function createMenu<
	TComponents extends Components,
	TSlots extends string = 'default',
>(args: { slots?: TSlots[]; components: TComponents }) {
	const registry = createRegistry<TSlots>();
	const useSlotItems = createUseSlotItems(registry);
	const registerFns = createRegisterFns(registry, args.components);

	return {
		useSlotItems,
		...registerFns,
	};
}
