# Menni

Simple, headless & type-safe menus library for React.

## Why?

Menni lets you create reactive menus for pluggable applications, and allow 3rd parties extend your application with a
set of closed components and their configurations. This is useful for keeping the UI consistent, while still allowing
for some amount of extensibility. It's also useful when you want to separate your code into independent packages/modules
that extend a host application with their own menu items.

## Usage

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

In addition, you can specify multiple slots for your menu which will allow you to group the menu items and
place them in different parts of the UI. Whether you're specifying slots or not, Menni will always create a
`'default'` slot for you:

```tsx
import { createMenu } from 'menni';

export const menu = createMenu({
  slots: ['links', 'actions'],
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
  slot: 'links',
  props: {
    text: 'Home',
    href: '/',
  },
});

menu.registerButton({
  id: 'login',
  slot: 'actions',
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
import { Logo } from './logo';

const Header = () => {
  const links = menu.useSlotItems('links');
  const actions = menu.useSlotItems('actions');

  return (
    <header>
      <nav>
        <ul>
          {links.map(({ id, MenuItem }) => (
            <li key={id}>
              <MenuItem />
            </li>
          ))}
        </ul>
      </nav>

      <Logo />

      <nav>
        <ul>
          {actions.map(({ id, MenuItem }) => (
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
