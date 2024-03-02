function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  additionalEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {},
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (
      checkForDefaultPrevented === false ||
      !(event as unknown as Event).defaultPrevented
    ) {
      return additionalEventHandler?.(event);
    }
  };
}

export { composeEventHandlers };
