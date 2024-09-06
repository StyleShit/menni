import { describe, expect, it } from 'vitest';
import { createMenu } from '../index';
import { render, screen } from '@testing-library/react';
import { act } from 'react';

describe('Menni', () => {
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

		menu.registerB({
			id: 'item-B',
			props: {},
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
		act(() => {
			menu.registerA({
				id: 'item-A-new',
				props: {
					title: 'new A',
				},
			});
		});

		// Assert.
		expect(screen.getByText('initial A')).toBeInTheDocument();
		expect(screen.getByText('new A')).toBeInTheDocument();
	});
});
