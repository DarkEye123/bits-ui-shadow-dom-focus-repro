import { mount } from 'svelte';
import Demo from './Demo.svelte';

// Control: the same component in the light DOM, portalling to document.body.
mount(Demo, { target: document.getElementById('light'), props: { name: 'light' } });

// The component inside an open Shadow Root, portalling into an element inside that root.
const shadowRoot = document.getElementById('shadow-host').attachShadow({ mode: 'open' });
const portalTarget = document.createElement('div');
mount(Demo, { target: shadowRoot, props: { name: 'shadow', portalTarget } });
shadowRoot.append(portalTarget);

// Like a widget opened from a button on the host page: a new Shadow Root whose dialog is open on mount.
document.getElementById('mount-open').addEventListener('click', () => {
	const host = document.createElement('div');
	document.body.append(host);
	const root = host.attachShadow({ mode: 'open' });
	const target = document.createElement('div');
	mount(Demo, { target: root, props: { name: 'mounted', portalTarget: target, initiallyOpen: true } });
	root.append(target);
});
