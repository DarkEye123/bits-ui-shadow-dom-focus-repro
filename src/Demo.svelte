<script>
	import { BitsConfig, Dialog } from 'bits-ui';
	import { onMount } from 'svelte';

	let { name, portalTarget = undefined, initiallyOpen = false } = $props();
	let isOpen = $state(false);
	let tabLog = $state([]);
	let focusAfterClose = $state('');

	// The element that really has focus, looking through Shadow Roots.
	function describeFocus() {
		let element = document.activeElement;
		while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement;
		if (!element || element === document.body) return 'nothing (the page body)';
		return element.dataset.label ?? element.tagName.toLowerCase();
	}

	// Record where focus is after opening and after every Tab, including when it leaves the dialog.
	function recordFocus(delay = 50) {
		setTimeout(() => (tabLog = [...tabLog, describeFocus()]), delay);
	}

	function handleOpenChange(open) {
		isOpen = open;
		if (open) {
			tabLog = [];
			focusAfterClose = '';
			// bits-ui moves focus into the dialog on the next animation frame.
			recordFocus(200);
			return;
		}
		// bits-ui restores focus while the dialog unmounts, so read it a moment later.
		setTimeout(() => (focusAfterClose = describeFocus()), 100);
	}

	function handleKeyup(event) {
		if (isOpen && event.key === 'Tab') recordFocus();
	}

	onMount(() => {
		if (initiallyOpen) handleOpenChange(true);
	});
</script>

<svelte:window onkeyup={handleKeyup} />

<BitsConfig defaultPortalTo={portalTarget}>
	<Dialog.Root open={initiallyOpen} onOpenChange={handleOpenChange}>
		{#if !initiallyOpen}
			<Dialog.Trigger data-label={`"Open ${name} dialog" button`}>Open {name} dialog</Dialog.Trigger>
		{/if}
		<Dialog.Portal>
			<Dialog.Overlay style="position: fixed; inset: 0; background: rgb(0 0 0 / 40%);" />
			<Dialog.Content
				data-testid={`${name}-dialog`}
				style="position: fixed; top: 20%; left: 20%; padding: 16px; background: white; border: 1px solid;"
			>
				<Dialog.Title>{name} dialog</Dialog.Title>
				<p><button type="button" data-label="First">First</button></p>
				<p><button type="button" data-label="Second">Second</button></p>
				<p><Dialog.Close data-label="Close">Close</Dialog.Close></p>
				<p>Expected Tab order: First → Second → Close → First → …</p>
				<p data-testid={`${name}-tab-log`}>Focus after opening, then after each Tab: {tabLog.join(' → ')}</p>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
	<p data-testid={`${name}-after-close`}>
		Focused after the last close: <strong>{focusAfterClose || '(not closed yet)'}</strong>
	</p>
</BitsConfig>
