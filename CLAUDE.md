# ToGezzer Frontend

## UI Library: daisyUI 5 + Tailwind CSS 4

This project uses **daisyUI 5** (CSS component library for Tailwind CSS 4).

### Setup
- Tailwind CSS 4: `@import "tailwindcss";` in CSS (no `tailwind.config.js`)
- daisyUI 5: `@plugin "daisyui";` in CSS

### Styling rules
- Use daisyUI class names first; fall back to Tailwind utilities for custom tweaks
- If Tailwind utility is overridden by specificity, use `!` suffix (e.g. `bg-red-500!`) — last resort only
- **Never** use Tailwind color names for text/bg (e.g. `text-gray-800`) — use daisyUI semantic colors instead, they adapt to themes automatically
- No `dark:` prefix needed for daisyUI color names
- No custom CSS unless unavoidable; no custom fonts unless required
- Layouts with `flex`/`grid` must be responsive using Tailwind responsive prefixes
- For placeholder images: `https://picsum.photos/200/300`
- Follow Refactoring UI best practices for design decisions

### daisyUI color tokens
Use these semantic colors so they change automatically with the theme:
`primary`, `primary-content`, `secondary`, `secondary-content`, `accent`, `accent-content`,
`neutral`, `neutral-content`, `base-100`, `base-200`, `base-300`, `base-content`,
`info`, `info-content`, `success`, `success-content`, `warning`, `warning-content`, `error`, `error-content`

### Component quick-reference

| Component | Main class | Key modifiers |
|-----------|-----------|---------------|
| Button | `btn` | `btn-primary/secondary/accent/…`, `btn-outline/ghost/link`, `btn-xs/sm/md/lg/xl`, `btn-circle/square/block` |
| Input | `input` | `input-primary/…`, `input-xs/sm/md/lg/xl`, `input-ghost` |
| Textarea | `textarea` | same color/size pattern as input |
| Select | `select` | same color/size pattern as input |
| Checkbox | `checkbox` | `checkbox-primary/…`, `checkbox-xs/…` |
| Radio | `radio` | `radio-primary/…`, `radio-xs/…` |
| Toggle | `toggle` | `toggle-primary/…`, `toggle-xs/…` |
| Badge | `badge` | `badge-primary/…`, `badge-outline/soft/ghost`, `badge-xs/…` |
| Alert | `alert` | `alert-info/success/warning/error`, `alert-outline/soft` |
| Card | `card` | `card-body`, `card-title`, `card-actions`, `card-border`, `card-xs/…` |
| Modal | `modal` + `modal-box` | Use `<dialog>` + `showModal()` (preferred) |
| Navbar | `navbar` | `navbar-start/center/end` |
| Menu | `menu` | `menu-horizontal/vertical`, `menu-xs/…` |
| Drawer | `drawer` | `drawer-content`, `drawer-side`, `drawer-toggle`, `lg:drawer-open` |
| Dropdown | `dropdown` + `dropdown-content` | Use `<details>/<summary>` or popover API |
| Tabs | `tabs` + `tab` | `tabs-box/border/lift`, `tab-active` |
| Avatar | `avatar` | `avatar-online/offline/placeholder`, `avatar-group` |
| Chat bubble | `chat chat-start/end` | `chat-bubble`, `chat-bubble-primary/…` |
| Loading | `loading` | `loading-spinner/dots/ring/…`, `loading-xs/…` |
| Skeleton | `skeleton` | `skeleton-text` |
| Progress | `progress` | `progress-primary/…` (set `value` + `max`) |
| Radial progress | `radial-progress` | CSS var `--value` (0–100) |
| Toast | `toast` | `toast-start/center/end`, `toast-top/bottom` |
| Tooltip | `tooltip` | `data-tip="…"`, `tooltip-top/bottom/left/right` |
| Divider | `divider` | `divider-horizontal/vertical`, `divider-primary/…` |
| Steps | `steps` + `step` | `step-primary/…`, `steps-vertical/horizontal` |
| Table | `table` | `table-zebra`, `table-xs/…` — wrap in `overflow-x-auto` |
| Stat | `stats` + `stat` | `stat-title`, `stat-value`, `stat-desc` |
| Accordion | `collapse` | `collapse-arrow/plus`, radio inputs inside |
| Join | `join` + `join-item` | `join-vertical/horizontal` |
| Dock | `dock` + `dock-label` | `dock-active`, `dock-xs/…` |
| Stack | `stack` | `stack-top/bottom/start/end` |
| Swap | `swap` | `swap-on/off`, `swap-rotate/flip` |
| FAB | `fab` | `fab-flower`, `fab-close`, `fab-main-action` |
| Fieldset | `fieldset` + `fieldset-legend` | |
| Validator | `validator` + `validator-hint` | |
| Theme controller | `theme-controller` | value = daisyUI theme name |

### Accordion (radio-based)
```html
<div class="collapse collapse-arrow">
  <input type="radio" name="group-name" />
  <div class="collapse-title">Title</div>
  <div class="collapse-content">Content</div>
</div>
```
Use same `name` for items in the same group; different names for separate groups.

### Modal (preferred pattern)
```html
<button onclick="my_modal.showModal()">Open</button>
<dialog id="my_modal" class="modal">
  <div class="modal-box">Content</div>
  <form method="dialog" class="modal-backdrop"><button>close</button></form>
</dialog>
```

### Drawer (sidebar always visible on lg)
```html
<div class="drawer lg:drawer-open">
  <input id="my-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content"><!-- page content --></div>
  <div class="drawer-side">
    <label for="my-drawer" class="drawer-overlay"></label>
    <ul class="menu bg-base-200 min-h-full w-80 p-4"><!-- nav items --></ul>
  </div>
</div>
```

### Custom theme (in CSS)
```css
@import "tailwindcss";
@plugin "daisyui";
@plugin "daisyui/theme" {
  name: "mytheme";
  default: true;
  prefersdark: false;
  color-scheme: light;
  --color-base-100: oklch(98% 0.02 240);
  /* … all required CSS vars … */
}
```
All `--color-*`, `--radius-*`, `--size-*`, `--border`, `--depth`, `--noise` vars are required.
