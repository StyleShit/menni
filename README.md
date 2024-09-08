# Menni

Simple, headless & type-safe menus library for React.

## Why?

Menni lets you create reactive menus for pluggable application, and allows 3rd parties to extend your application with a
set of closed components and their configurations. This is useful for keeping the UI consistent, while still allowing
for some amount of extensibility. It's also useful when you want to separate your code into independent packages/modules
that extend a host application with their own menu items.

## Usage

To start, create a menu using the `createMenu` function. It accepts a list of components that you want to allow
registering into your menu, and an optional list of slots that you want to use to group the menu items (we'll see later on how to use these slots):

```tsx
import { createMenu } from 'menni';

export const mainMenu = createMenu({
  slots: ['links', 'actions'],
  components: {
    Link: (props: { text: string; href: string }) => (
      <a href={props.href}>{props.text}</a>
    ),
    Button: (props: { text: string; onClick: () => void }) => (
      <button onClick={props.onClick}>{props.text}</button>
    ),
  },
});
```

Now, use the `mainMenu` object to register components into the menu. For each component you've provided to `createMenu`,
you'll have a corresponding `register{ComponentName}` method on the `mainMenu` object.

Each of these methods accepts a configuration object with the following properties:

- `id`: _Required._ A unique identifier for the menu item.
- `slot`: _Optional._ The slot where the menu item should be placed. Defaults to `'default'`.
- `priority`: _Optional._ The priority of the menu item. Lower values will be placed first. Defaults to `10`.
- `override`: _Optional._ Whether to override an existing menu item with the same `id`. Defaults to `false`.
- `props`: _Partially Required._ The props to pass to the component. These are typed and inferred automatically per component.
- `useProps`: _Partially Required._ A function that replaces the `props` object and lets you make the them reactive by using hooks.

```tsx
import { useState } from 'react';
import { mainMenu } from './main-menu';

mainMenu.registerLink({
  id: 'home',
  slot: 'links',
  props: {
    text: 'Home',
    href: '/',
  },
});

mainMenu.registerButton({
  id: 'login',
  slot: 'actions',
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
import { mainMenu } from './main-menu';

mainMenu.unregister('home');
```

Finally, you can render the menu using the `useSlotItems` hook. It accepts the slot name as an argument, and returns an
array of items for that slot, sorted by priority. This hook is reactive, so it will update the UI whenever a menu item
is being registered or unregistered from the specific slot you're using:

```tsx
import { mainMenu } from './main-menu';
import { Logo } from './logo';

const Header = () => {
  const links = mainMenu.useSlotItems('links');
  const actions = mainMenu.useSlotItems('actions');

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
