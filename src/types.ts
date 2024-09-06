import type { ComponentPropsWithoutRef, ComponentType } from 'react';

export type Components = Record<string, ComponentType<any>>;

export type AnyFunction = (...args: any[]) => any;

export type Registry<TSlots extends string> = {
	subscribe: (subscriber: () => void) => () => void;
	notify: () => void;
	items: Map<TSlots | 'default', Map<string, RegistryItem>>;
};

type RegistryItem = {
	id: string;
	component: ComponentType;
};

export type RegisterFns<
	TSlots extends string,
	TComponents extends Components,
> = {
	[K in keyof TComponents as `register${Capitalize<K & string>}`]: RegisterItem<
		TSlots,
		TComponents[K]
	>;
};

export type RegisterItem<
	TSlots extends string,
	T extends ComponentType,
> = (args: {
	id: string;
	slot?: 'default' | TSlots;
	props: ComponentPropsWithoutRef<T>;
}) => void;

export type UseSlotItems<TSlots extends string> = (
	slot?: TSlots | 'default',
) => Array<{
	id: string;
	MenuItem: ComponentType;
}>;
