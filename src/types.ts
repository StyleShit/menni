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
	priority: number;
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
	TComponent extends ComponentType,
> = (
	args: {
		id: string;
		slot?: 'default' | TSlots;
		priority?: number;
		override?: boolean;
	} & PropsOrUseProps<TComponent>,
) => void;

type PropsOrUseProps<T extends ComponentType> =
	unknown extends ComponentPropsWithoutRef<T>
		? { props?: never; useProps?: never }
		:
				| { props: ComponentPropsWithoutRef<T>; useProps?: never }
				| {
						useProps: () => ComponentPropsWithoutRef<T>;
						props?: never;
				  };

export type UseSlotItems<TSlots extends string> = (
	slot?: TSlots | 'default',
) => Array<{
	id: string;
	MenuItem: ComponentType;
}>;
