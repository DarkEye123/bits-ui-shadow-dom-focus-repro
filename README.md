# bits-ui: Dialog focus inside a Shadow Root

Minimal reproduction for a bits-ui `Dialog` whose content portals into an element inside an open
Shadow Root (via `<BitsConfig defaultPortalTo>`), as in an embeddable web widget.

- bits-ui 2.19.3, svelte 5.57.1, vite 7
- Open in StackBlitz: https://stackblitz.com/github/DarkEye123/bits-ui-shadow-dom-focus-repro
- Upstream issue: https://github.com/huntabyte/bits-ui/issues/2178

```bash
npm install
npm run dev
```

## What a modal dialog should do

- **Trap focus:** while it is open, Tab cycles through the dialog's own buttons
  (First → Second → Close → First) and never reaches the page behind it.
- **Restore focus:** when it closes, focus returns to the element that opened it, so a keyboard
  user continues from there instead of from the top of the page.

## How to test

Use the keyboard only: Tab to a case's button, press Enter to open the dialog, press Tab four
times, press Escape. Each case prints where focus was after opening and after each Tab, and what
was focused after the dialog closed.

In Safari, use Option+Tab (plain Tab moves only between text fields), and open the dialogs with
the keyboard: Safari does not focus a clicked button, so after a mouse click it has nothing to
restore, even in the light DOM.

## Cases and results

### 1. Light DOM (control): works

- **Expected and actual:** focus log `First → Second → Close → First → Second`. After Escape,
  focus is on the "Open light dialog" button.

### 2. Inside a Shadow Root, trigger inside the root: focus restore broken

- **Expected:** the same as case 1. After Escape, focus is on the "Open shadow dialog" button.
- **Actual (Chrome, Firefox, Safari):** the focus log is correct, but after Escape **nothing is
  focused** ("nothing (the page body)"). The next Tab starts again from the top of the page.
- Why Tab looks right here: bits-ui's own wrap check never matches (see "Cause"), so Tab after
  Close really does leave the dialog. It lands on the next focusable element on the page (the
  case 3 button). That focus change is visible to the document, so bits-ui's "focus escaped"
  handler pulls focus back to First. The result looks like wrapping, but only because something
  focusable follows the widget.

### 3. Inside a Shadow Root, dialog open on mount: focus trap broken

The button mounts a new Shadow Root at the end of the page whose dialog starts open, like a
checkout popup. Nothing focusable comes after it.

- **Expected:** focus log `First → Second → Close → First → Second`.
- **Actual:**
  - Chrome and Safari: `First → Second → Close → nothing (the page body) → First`. Tab after
    Close **leaves the dialog**.
  - Firefox: `First → Second → Close → Close → Close`. Tab after Close **stays on Close**.

## Cause

`FocusScope` asks the document which element has focus. Inside a Shadow Root the document
answers with the shadow host, not the focused element (`focus-scope.svelte.ts`,
`focus-scope-manager.ts`):

- open auto-focus checks `container.ownerDocument.activeElement`;
- Tab wrapping compares `doc.activeElement` with the first and last tabbable, which never matches;
- the `focusin` handler reads `e.target`, which is retargeted to the host;
- the element to restore is stored as `document.activeElement` (the host), and restore checks
  `document.contains(...)`, which is false for nodes inside a Shadow Root.

## Fix

Read the focused element with svelte-toolbelt's `getActiveElement(doc)` (it follows
`shadowRoot.activeElement` down), read the `focusin` target with `e.composedPath()[0]`, and check
`preFocusedElement.isConnected` instead of `document.contains(...)`. With those changes, cases 2
and 3 behave like case 1 in Chrome, Firefox and Safari.
