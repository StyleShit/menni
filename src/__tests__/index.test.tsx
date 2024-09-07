import {
	afterAll,
	beforeAll,
	describe,
	expect,
	expectTypeOf,
	it,
	vi,
} from 'vitest';
import { createMenu } from '../index';
import { render, renderHook, screen } from '@testing-library/react';
import { act, useState } from 'react';

describe('Menni', () => {
	beforeAll(() => {
		vi.useFakeTimers();
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	it('should create a menu that can register items and retrieve them', () => {
		// Arrange.
		const menu = createMenu({
			components: {
				A: ({ title }: { title: string }) => <span>{title}</span>,
				B: () => <span>B</span>,
			},
		});

		// Act - Register items.
		menu.registerA({
			id: 'item-A',
			props: {
				title: 'A',
			},
		});

		menu.registerB({ id: 'item-B' });

		// Act - Render items.
		const Component = () => {
			const items = menu.useSlotItems();

			return (
				<div>
					{items.map(({ id, MenuItem }) => (
						<MenuItem key={id} />
					))}
				</div>
			);
		};

		render(<Component />);

		// Assert.
		expect(screen.getByText('A')).toBeInTheDocument();
		expect(screen.getByText('B')).toBeInTheDocument();
	});

	it('should support custom slots', () => {
		// Arrange.
		const menu = createMenu({
			slots: ['slot-1', 'slot-2', 'slot-3'],
			components: {
				A: ({ title }: { title: string }) => <span>{title}</span>,
			},
		});

		// Act - Register items.
		menu.registerA({
			id: 'item-A-slot-1',
			slot: 'slot-1',
			props: {
				title: 'A - slot-1',
			},
		});

		menu.registerA({
			id: 'item-A-slot-2',
			slot: 'slot-2',
			props: {
				title: 'A - slot-2',
			},
		});

		menu.registerA({
			id: 'item-A-slot-3',
			slot: 'slot-3',
			props: {
				title: 'A - slot-3',
			},
		});

		// Act - Render items.
		const Component = () => {
			const slot1Items = menu.useSlotItems('slot-1');
			const slot2Items = menu.useSlotItems('slot-2');

			return (
				<div>
					{slot1Items.map(({ id, MenuItem }) => (
						<MenuItem key={id} />
					))}

					{slot2Items.map(({ id, MenuItem }) => (
						<MenuItem key={id} />
					))}
				</div>
			);
		};

		render(<Component />);

		// Assert.
		expect(screen.getByText('A - slot-1')).toBeInTheDocument();
		expect(screen.getByText('A - slot-2')).toBeInTheDocument();
		expect(screen.queryByText('A - slot-3')).not.toBeInTheDocument();
	});

	it('should support priorities', () => {
		// Arrange.
		const menu = createMenu({
			components: {
				A: ({ title }: { title: string }) => title,
			},
		});

		// Act - Register items.
		menu.registerA({
			id: 'item-A-priority-10',
			priority: 10,
			props: {
				title: 'A - priority 10',
			},
		});

		menu.registerA({
			id: 'item-A-priority-2',
			priority: 1,
			props: {
				title: 'A - priority 1',
			},
		});

		// Act - Render items.
		const Component = () => {
			const items = menu.useSlotItems();

			return (
				<>
					{items.map(({ id, MenuItem }) => (
						<MenuItem key={id} />
					))}
				</>
			);
		};

		const { container } = render(<Component />);

		// Assert.
		expect(container.innerHTML).toBe('A - priority 1A - priority 10');
	});

	it('should throw when trying to register item with an existing id', () => {
		// Arrange.
		const menu = createMenu({
			components: {
				A: () => <></>,
			},
		});

		menu.registerA({
			id: 'item-A',
		});

		// Act & Assert.
		expect(() => {
			menu.registerA({
				id: 'item-A',
			});
		}).toThrowError(
			"Item with id 'item-A' already exists in slot 'default'. Use 'override' to replace it.",
		);
	});

	it('should override an existing item when override is set to true', () => {
		// Arrange.
		const menu = createMenu({
			components: {
				A: ({ title }: { title: string }) => <span>{title}</span>,
			},
		});

		menu.registerA({
			id: 'item-A',
			props: {
				title: 'initial A',
			},
		});

		// Act - Register a new item.
		menu.registerA({
			id: 'item-A',
			override: true,
			props: {
				title: 'new A',
			},
		});

		// Act - Render items.
		const Component = () => {
			const items = menu.useSlotItems();

			return (
				<div>
					{items.map(({ id, MenuItem }) => (
						<MenuItem key={id} />
					))}
				</div>
			);
		};

		render(<Component />);

		// Assert.
		expect(screen.queryByText('initial A')).not.toBeInTheDocument();
		expect(screen.getByText('new A')).toBeInTheDocument();
	});

	it('should support reactive props', () => {
		// Arrange.
		const menu = createMenu({
			components: {
				A: ({
					checked,
					toggle,
				}: {
					checked: boolean;
					toggle: () => void;
				}) => (
					<button onClick={toggle}>
						{checked ? 'checked' : 'unchecked'}
					</button>
				),
			},
		});

		menu.registerA({
			id: 'item-A',
			useProps: () => {
				const [checked, setChecked] = useState(false);

				return {
					checked,
					toggle: () => {
						setChecked((prev) => !prev);
					},
				};
			},
		});

		// Act - Render.
		const Component = () => {
			const items = menu.useSlotItems();

			return (
				<>
					{items.map(({ id, MenuItem }) => (
						<MenuItem key={id} />
					))}
				</>
			);
		};

		render(<Component />);

		// Assert.
		const button = screen.getByRole('button');

		expect(button).toHaveTextContent('unchecked');

		// Act - Click the button.
		act(() => {
			button.click();
		});

		// Assert.
		expect(button).toHaveTextContent('checked');
	});

	it('should re-render on item registration', () => {
		// Arrange.
		const menu = createMenu({
			components: {
				A: ({ title }: { title: string }) => <span>{title}</span>,
			},
		});

		menu.registerA({
			id: 'item-A-initial',
			props: {
				title: 'initial A',
			},
		});

		// Act - Render items.
		const Component = () => {
			const items = menu.useSlotItems();

			return (
				<div>
					{items.map(({ id, MenuItem }) => (
						<MenuItem key={id} />
					))}
				</div>
			);
		};

		render(<Component />);

		// Assert.
		expect(screen.getByText('initial A')).toBeInTheDocument();
		expect(screen.queryByText('new A')).not.toBeInTheDocument();

		// Act - Register a new item.
		menu.registerA({
			id: 'item-A-new',
			props: {
				title: 'new A',
			},
		});

		act(() => {
			vi.runAllTimers();
		});

		// Assert.
		expect(screen.getByText('initial A')).toBeInTheDocument();
		expect(screen.getByText('new A')).toBeInTheDocument();
	});

	it('should re-renders only the changed slot', () => {
		// Arrange.
		let renders = 0;

		const menu = createMenu({
			slots: ['a', 'b'],
			components: {
				A: () => <></>,
			},
		});

		// Act - Render items.
		const Component = () => {
			renders++;

			const items = menu.useSlotItems('a');

			return (
				<div>
					{items.map(({ id, MenuItem }) => (
						<MenuItem key={id} />
					))}
				</div>
			);
		};

		render(<Component />);

		// Act - Register into different slots.
		menu.registerA({ id: 'a-1', slot: 'default' });
		menu.registerA({ id: 'a-2', slot: 'b' });

		act(() => {
			vi.runAllTimers();
		});

		// Assert.
		expect(renders).toBe(1);
	});

	it('should support item unregistration', () => {
		// Arrange.
		const menu = createMenu({
			components: {
				A: () => 'A',
			},
		});

		menu.registerA({ id: 'item-A' });

		const Component = () => {
			const items = menu.useSlotItems();

			return (
				<div>
					{items.map(({ id, MenuItem }) => (
						<MenuItem key={id} />
					))}
				</div>
			);
		};

		render(<Component />);

		// Assert.
		expect(screen.getByText('A')).toBeInTheDocument();

		// Act.
		menu.unregister('item-A');

		act(() => {
			vi.runAllTimers();
		});

		// Assert.
		expect(screen.queryByText('A')).not.toBeInTheDocument();
	});

	it('should batch re-renders', () => {
		// Arrange.
		let renders = 0;

		const menu = createMenu({
			components: {
				A: () => <></>,
			},
		});

		// Act - Render items.
		const Component = () => {
			renders++;

			const items = menu.useSlotItems();

			return (
				<div>
					{items.map(({ id, MenuItem }) => (
						<MenuItem key={id} />
					))}
				</div>
			);
		};

		render(<Component />);

		// Act - Register multiple item.
		menu.registerA({ id: 'a-1' });
		menu.registerA({ id: 'a-2' });
		menu.registerA({ id: 'a-3' });

		act(() => {
			vi.runAllTimers();
		});

		// Assert.
		expect(renders).toBe(2);
	});

	it('should have proper types for menu creation', () => {
		expectTypeOf(createMenu).parameter(0).toEqualTypeOf<{
			components: Record<string, React.ComponentType<any>>;
			slots?: string[];
		}>();

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const menu = createMenu({
			components: {
				A: ({ title }: { title: string }) => <span>{title}</span>,
				B: () => <span>B</span>,
			},
			slots: ['a', 'b'],
		});

		expectTypeOf<keyof typeof menu>().toEqualTypeOf<
			'registerA' | 'registerB' | 'useSlotItems' | 'unregister'
		>();
	});

	it('should have proper types for items registration', () => {
		const menu = createMenu({
			components: {
				A: ({ title }: { title: string }) => <span>{title}</span>,
				B: () => <span>B</span>,
			},
			slots: ['a', 'b'],
		});

		type RegisterA = Parameters<typeof menu.registerA>[0];

		expectTypeOf<keyof RegisterA>().toEqualTypeOf<
			'id' | 'slot' | 'priority' | 'override' | 'props' | 'useProps'
		>();

		expectTypeOf<RegisterA['id']>().toEqualTypeOf<string>();

		expectTypeOf<RegisterA['slot']>().toEqualTypeOf<
			'a' | 'b' | 'default' | undefined
		>();

		expectTypeOf<RegisterA['priority']>().toEqualTypeOf<
			number | undefined
		>();

		expectTypeOf<RegisterA['override']>().toEqualTypeOf<
			boolean | undefined
		>();

		expectTypeOf<RegisterA['props']>().toEqualTypeOf<
			{ title: string } | undefined
		>();

		expectTypeOf<RegisterA['useProps']>().toEqualTypeOf<
			(() => { title: string }) | undefined
		>();

		// @ts-expect-error Cannot use both `props` and `useProps`.
		menu.registerA({
			id: 'item-A',
			props: {
				title: 'A',
			},
			useProps: () => ({ title: 'A' }),
		});

		type RegisterB = Parameters<typeof menu.registerB>[0];

		expectTypeOf<RegisterB['props']>().toEqualTypeOf<undefined>();
		expectTypeOf<RegisterB['useProps']>().toEqualTypeOf<undefined>();
	});

	it('should have proper types for items retrieval', () => {
		const menu = createMenu({
			components: {},
			slots: ['a', 'b'],
		});

		expectTypeOf(menu.useSlotItems)
			.parameter(0)
			.toEqualTypeOf<'a' | 'b' | 'default' | undefined>();

		const defaultItems = renderHook(() => menu.useSlotItems()).result
			.current;

		const aItems = renderHook(() => menu.useSlotItems('a')).result.current;
		const bItems = renderHook(() => menu.useSlotItems('b')).result.current;

		expectTypeOf(defaultItems).items.toEqualTypeOf<{
			id: string;
			MenuItem: React.ComponentType;
		}>();

		expectTypeOf(aItems).items.toEqualTypeOf<{
			id: string;
			MenuItem: React.ComponentType;
		}>();

		expectTypeOf(bItems).items.toEqualTypeOf<{
			id: string;
			MenuItem: React.ComponentType;
		}>();
	});

	it('should have proper types for items unregistration', () => {
		const menu = createMenu({
			components: {},
		});

		expectTypeOf(menu.unregister).toEqualTypeOf<(id: string) => void>();
	});
});
