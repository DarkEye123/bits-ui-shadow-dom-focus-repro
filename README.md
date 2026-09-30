# bits-ui: Dialog focus trap inside a Shadow Root

Minimal reproduction for a bits-ui `Dialog` whose content portals into an element inside an open
Shadow Root (via `<BitsConfig defaultPortalTo>`), as in an embeddable web widget.

- bits-ui 2.19.3, svelte 5.57.1, vite 7
- Open in StackBlitz: https://stackblitz.com/github/DarkEye123/bits-ui-shadow-dom-focus-repro

```bash
npm install
npm run dev
```

The page has three cases. Nothing focusable follows them, like a widget appended to the end of
`body`. Each dialog shows the element that really has focus (`shadowRoot.activeElement`).

1. **Light DOM** (control): the same component portalling to `document.body`.
2. **Shadow Root, trigger inside the root.**
3. **Shadow Root, dialog open on mount**: the page button mounts a new Shadow Root whose dialog
   starts open, like a checkout popup.

Steps: open a dialog, press Tab (Option+Tab in Safari) past the last button, then press Escape.

| Case                        | Chromium                                     | Firefox                        | WebKit                                       |
| --------------------------- | -------------------------------------------- | ------------------------------ | -------------------------------------------- |
| Light DOM                   | Tab wraps; focus returns to the trigger      | same                           | Tab wraps                                    |
| Shadow Root, trigger inside | Tab wraps; **focus returns to `body`**       | **focus returns to `body`**    | Tab wraps                                    |
| Shadow Root, open on mount  | **Tab past the last button leaves the dialog** | **Tab stays on the last button** | **Tab past the last button leaves the dialog** |

Cause: `FocusScope` compares focus against the document, which reports the shadow host instead of
the focused element (`focus-scope.svelte.ts`, `focus-scope-manager.ts`).

Replacing those reads with svelte-toolbelt's `getActiveElement(doc)`, reading the `focusin`
target with `e.composedPath()[0]`, and checking `preFocusedElement.isConnected` instead of
`document.contains(...)` fixes all three Shadow Root rows in all three browsers.
