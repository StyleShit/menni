# Menni

Simple & type-safe menus library for React.

## Usage

Menni lets you create a menu with your own UI components, and manages the state of the menu for you.

To start, create a menu using the `createMenu` function. It accepts a list of components that you want to allow
registering into your menu:

```tsx
import { createMenu } from 'menni';

export const menu = createMenu({
  components: {
    Link: ({ text, href }) => <a href={href}>{text}</a>,
    Button: ({ text, onClick }) => <button onClick={onClick}>{text}</button>,
  },
});
```

In addition, you can specify multiple slots for your menu, which will allow you to place menu items in different parts of
your UI. Whether you're specifying slots or not, Menni will always create a `'default'` slot for you:

```tsx
import { createMenu } from 'menni';

export const menu = createMenu({
  slots: ['left', 'right'],
  components: {
    Link: ({ text, href }) => <a href={href}>{text}</a>,
    Button: ({ text, onClick }) => <button onClick={onClick}>{text}</button>,
  },
});
```

Then, you can use the `menu` object to register components into the menu. For each component you've provided to `createMenu`,
you'll have a corresponding `register{ComponentName}` method on the `menu` object.

Each `register{ComponentName}` method accepts a configuration object with the following properties:

- `id`: _Required._ A unique identifier for the menu item.
- `slot`: _Optional._ The slot where the menu item should be placed. Defaults to `'default'`.
- `priority`: _Optional._ The priority of the menu item. Lower values will be placed first. Defaults to `10`.
- `override`: _Optional._ Whether to override an existing menu item with the same `id`. Defaults to `false`.
- `props`: _Required._ The props to pass to the component.
- `useProps`: _Required._ A function that replaces the `props` object, and lets you make the them reactive by using hooks.

```tsx
import { menu } from './menu';
import { useState } from 'react';

menu.registerLink({
  id: 'home',
  slot: 'left',
  props: {
    text: 'Home',
    href: '/',
  },
});

menu.registerButton({
  id: 'login',
  slot: 'right',
  priority: 0,
  useProps: () => {
    const [isClicked, setIsClicked] = useState(false);

    return {
      text: isClicked ? 'Logout' : 'Login',
      onClick: () => setIsClicked((prev) => !prev),
    };
  },
});
```

You can also unregister a menu item using the `unregister` method. It accepts the `id` of the menu item you want to
unregister:

```tsx
import { menu } from './menu';

menu.unregister('home');
```

Finally, you can render the menu using the `useSlotItems` hook. It accepts the slot name as an argument, and returns an
array of items for that slot, sorted by priority:

```tsx
import { menu } from './menu';

const Header = () => {
  const leftItems = menu.useSlotItems('left');
  const rightItems = menu.useSlotItems('right');

  return (
    <header>
      <nav>
        <ul>
          {leftItems.map(({ id, MenuItem }) => (
            <li key={id}>
              <MenuItem />
            </li>
          ))}
        </ul>
      </nav>
      <nav>
        <ul>
          {rightItems.map(({ id, MenuItem }) => (
            <li key={id}>
              <MenuItem />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};
```

This hook is reactive, so it will update the UI whenever a menu item is being registered or unregistered from the slot
you're using.
