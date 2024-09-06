import { capitalize, debounce } from './utils';
import { useEffect, useReducer, type ComponentType } from 'react';
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
	const registry = createRegistry<TSlots>();

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

function createRegistry<TSlots extends string>(): Registry<TSlots> {
	const subscribers = new Set<() => void>();

	const subscribe = (subscriber: () => void) => {
		subscribers.add(subscriber);

		return () => {
			subscribers.delete(subscriber);
		};
	};

	const notify = debounce(() => {
		subscribers.forEach((subscriber) => {
			subscriber();
		});
	}, 0);

	return {
		items: new Map(),
		subscribe,
		notify,
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
	return ({ slot = 'default', id, props, priority = 10 }) => {
		if (!registry.items.has(slot)) {
			registry.items.set(slot, new Map());
		}

		registry.items.get(slot)?.set(id, {
			id,
			priority,
			component: () => <Component {...(props as any)} />,
		});

		registry.notify();
	};
}

function createUseSlotItems<TSlots extends string>(
	registry: Registry<TSlots>,
): UseSlotItems<TSlots> {
	return (slot = 'default') => {
		const [, reRender] = useReducer((p) => !p, false);

		useEffect(() => {
			return registry.subscribe(reRender);
		}, []);

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
