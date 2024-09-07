import type { ComponentType } from 'react';
import { debounce } from './utils';

export type Registry<TSlots extends string> = {
	subscribe: (subscriber: () => void) => () => void;
	notify: () => void;
	items: Map<TSlots | 'default', Map<string, RegistryItem>>;
};

type RegistryItem = {
	id: string;
	priority: number;
	component: ComponentType;
};

export function createRegistry<TSlots extends string>(): Registry<TSlots> {
	const subscribers = new Set<() => void>();
	const items: Registry<TSlots>['items'] = new Map();

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
		items,
		subscribe,
		notify,
	};
}
