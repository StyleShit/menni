import { capitalize } from './utils';
import type { ComponentType } from 'react';
import type {
	AnyFunction,
	Components,
	RegisterFns,
	RegisterItem,
	Registry,
	UseSlotItems,
} from './types';

export function createMenu<
	TComponents extends Components,
	TSlots extends string = 'default',
>(args: { slots?: TSlots[]; components: TComponents }) {
	const registry: Registry<TSlots> = new Map();

	const useSlotItems = createUseSlotItems(registry);

	const componentsRegisters = createComponentsRegisters(
		registry,
		args.components,
	);

	return {
		useSlotItems,
		...componentsRegisters,
	};
}

function createComponentsRegisters<
	TSlots extends string,
	TComponents extends Components,
>(registry: Registry<TSlots>, components: TComponents) {
	return Object.entries(components).reduce<Record<string, AnyFunction>>(
		(acc, [key, component]) => {
			const name = `register${capitalize(key)}`;

			acc[name] = createRegisterItem(registry, component);

			return acc;
		},
		{},
	) as RegisterFns<TSlots, TComponents>;
}

function createRegisterItem<
	TSlots extends string,
	TComponent extends ComponentType,
>(
	registry: Registry<TSlots>,
	Component: TComponent,
): RegisterItem<TSlots, TComponent> {
	return ({ slot = 'default', id, props }) => {
		if (!registry.has(slot)) {
			registry.set(slot, new Map());
		}

		registry.get(slot)?.set(id, {
			id,
			component: () => <Component {...(props as any)} />,
		});
	};
}

function createUseSlotItems<TSlots extends string>(
	registry: Registry<TSlots>,
): UseSlotItems<TSlots> {
	return (slot = 'default') => {
		const items = registry.get(slot);

		if (!items) {
			return [];
		}

		return [...items.values()].map(({ id, component }) => ({
			id,
			MenuItem: component,
		}));
	};
}
