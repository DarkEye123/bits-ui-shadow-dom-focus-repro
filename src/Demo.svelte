<script>
	import { BitsConfig, Dialog } from 'bits-ui';

	let { name, portalTarget = undefined, initiallyOpen = false } = $props();
	let open = $state(initiallyOpen);
	let log = $state([]);

	// The element that really has focus, even inside a Shadow Root.
	function focusedElement() {
		let element = document.activeElement;
		while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement;
		return element;
	}

	function record() {
		const element = focusedElement();
		const label = element?.dataset.label ?? element?.tagName.toLowerCase() ?? 'none';
		log = [...log, label];
	}
</script>

<BitsConfig defaultPortalTo={portalTarget}>
	<Dialog.Root bind:open onOpenChange={() => (log = [])}>
		{#if !initiallyOpen}
			<Dialog.Trigger data-label={`${name}-trigger`}>Open {name} dialog</Dialog.Trigger>
		{/if}
		<Dialog.Portal>
			<Dialog.Overlay style="position: fixed; inset: 0; background: rgb(0 0 0 / 40%);" />
			<Dialog.Content
				data-testid={`${name}-dialog`}
				style="position: fixed; top: 20%; left: 20%; padding: 16px; background: white; border: 1px solid;"
				onfocusin={() => queueMicrotask(record)}
			>
				<Dialog.Title>{name} dialog</Dialog.Title>
				<p><button type="button" data-label="first">First</button></p>
				<p><button type="button" data-label="second">Second</button></p>
				<p><Dialog.Close data-label="close">Close</Dialog.Close></p>
				<p data-testid={`${name}-focus-log`}>Focus inside the dialog: {log.join(' → ')}</p>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
</BitsConfig>
