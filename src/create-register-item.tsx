import type { ComponentPropsWithoutRef, ComponentType } from 'react';
import type { Registry } from './create-registry';

export type RegisterItem<
	TSlots extends string,
	TComponent extends ComponentType,
> = (
	args: {
		id: string;
		slot?: 'default' | TSlots;
		priority?: number;
		override?: boolean;
	} & Props<ComponentPropsWithoutRef<TComponent>>,
) => void;

type Props<TProps extends object> = unknown extends TProps
	? NoProps
	: PropsOrUseProps<TProps>;

type NoProps = { props?: never; useProps?: never };

type PropsOrUseProps<TProps extends object> =
	| { props: TProps; useProps?: never }
	| {
			useProps: () => TProps;
			props?: never;
	  };

export function createRegisterItem<
	TSlots extends string,
	TComponent extends ComponentType,
>(
	registry: Registry<TSlots>,
	Component: TComponent,
): RegisterItem<TSlots, TComponent> {
	return ({
		id,
		slot = 'default',
		priority = 10,
		override = false,
		props: _props,
		useProps: _useProps,
	}) => {
		if (!registry.slots.has(slot)) {
			registry.slots.set(slot, new Map());
		}

		const itemExists = !!registry.slots.get(slot)?.has(id);

		if (itemExists && !override) {
			throw new Error(
				`Item with id '${id}' already exists in slot '${slot}'. Use 'override' to replace it.`,
			);
		}

		const useProps = _useProps || (() => _props);

		registry.slots.get(slot)?.set(id, {
			id,
			priority,
			component: () => {
				const props = useProps();

				return <Component {...(props as any)} />;
			},
		});

		registry.notify();
	};
}
