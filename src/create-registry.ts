import type { ComponentType } from 'react';
import { debounce } from './utils';

export type Registry<TSlots extends string> = {
	subscribe: (subscriber: () => void) => () => void;
	notify: () => void;
	slots: Map<TSlots | 'default', Map<string, RegistryItem>>;
};

type RegistryItem = {
	id: string;
	priority: number;
	component: ComponentType;
};

export function createRegistry<TSlots extends string>(): Registry<TSlots> {
	const subscribers = new Set<() => void>();
	const slots: Registry<TSlots>['slots'] = new Map();

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
		slots,
		subscribe,
		notify,
	};
}
