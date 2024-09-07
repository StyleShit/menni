import type { ComponentType } from 'react';
import { debounce } from './utils';

export type Registry<TSlots extends string> = {
	subscribe: (slot: TSlots | 'default', subscriber: () => void) => () => void;
	notify: (slot: TSlots | 'default') => void;
	slots: Map<TSlots | 'default', Map<string, RegistryItem>>;
};

type RegistryItem = {
	id: string;
	priority: number;
	component: ComponentType;
};

export function createRegistry<TSlots extends string>(): Registry<TSlots> {
	const slots: Registry<TSlots>['slots'] = new Map();
	const subscribers = new Map<TSlots | 'default', Set<() => void>>();

	const subscribe: Registry<TSlots>['subscribe'] = (slot, subscriber) => {
		if (!subscribers.has(slot)) {
			subscribers.set(slot, new Set());
		}

		subscribers.get(slot)?.add(subscriber);

		return () => {
			subscribers.get(slot)?.delete(subscriber);
		};
	};

	const notify: Registry<TSlots>['notify'] = debounce((slot) => {
		subscribers.get(slot)?.forEach((subscriber) => {
			subscriber();
		});
	}, 0);

	return {
		slots,
		subscribe,
		notify,
	};
}
