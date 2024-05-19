import * as React from 'react';

import { Portal } from '@/components/portal/portal';
import { Presence } from '@/components/presence/presence';
import { composeEventHandlers } from '@/lib/composers/event';
import { createContextScope, Scope } from '@/lib/context/createContext';
import { useControllableState } from '@/lib/hooks/useControllableState';
import { useId } from '@/lib/hooks/useId';

/**
 * The type `ScopedProps` allows the property `__scopeDialog` to be accessed
 * inside the nested dialog components, without showing it on the components'
 * properties, when using a instance. To access the property, assign the first
 * parameter of the component declared function to the type.
 * E.g.: (props: ScopedProps<ComponentProps>) => {
 *    const { __scopeDialog, ...componentProps } = props;
 * }
 */
type ScopedProps<P> = P & { __scopeDialog?: Scope };

const DIALOG_NAME = 'Dialog';

const [createDialogContext, createDialogScope] =
  createContextScope(DIALOG_NAME);

type DialogContextValue = {
  contentId: string;
  contentRef: React.RefObject<DialogContentElement>;
  descriptionId: string;
  modal: boolean;
  onOpenChange(open: boolean): void;
  onOpenToggle(): void;
  open: boolean;
  titleId: string;
  triggerRef: React.RefObject<HTMLButtonElement>;
};

const [DialogProvider, useDialogContext] =
  createDialogContext<DialogContextValue>(DIALOG_NAME);

interface DialogProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  modal?: boolean;
  onOpenChange?(open: boolean): void;
  open?: boolean;
}

/**
 * The `Dialog` component pops up a window on the screen that allow the user to
 * interact with the content within their container.
 */

const Dialog: React.FunctionComponent<DialogProps> = (
  props: ScopedProps<DialogProps>,
) => {
  const {
    __scopeDialog,
    children,
    defaultOpen,
    modal = true,
    onOpenChange,
    open: openProp,
  } = props;
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<DialogContentElement>(null);

  const [open = false, setOpen] = useControllableState<boolean>({
    defaultProp: defaultOpen,
    onChange: onOpenChange,
    prop: openProp,
  });

  return (
    <DialogProvider
      contentId={useId()}
      contentRef={contentRef}
      descriptionId={useId()}
      modal={modal}
      onOpenChange={setOpen}
      onOpenToggle={React.useCallback(
        () => setOpen((prevOpen) => !prevOpen),
        [setOpen],
      )}
      open={open}
      scope={__scopeDialog}
      titleId={useId()}
      triggerRef={triggerRef}
    >
      {children}
    </DialogProvider>
  );
};

Dialog.displayName = DIALOG_NAME;

/* -------------------------------------------------------------------------------------------------
 * Dialog Trigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'DialogTrigger';

type DialogTriggerElement = React.ElementRef<'button'>;
type PrimitiveButtonProps = React.ComponentPropsWithoutRef<'button'>;
interface DialogTriggerProps extends PrimitiveButtonProps {}

const DialogTrigger = React.forwardRef<
  DialogTriggerElement,
  DialogTriggerProps
>((props: ScopedProps<DialogTriggerProps>, forwardedRef) => {
  const { __scopeDialog, onClick, ...triggerProps } = props;

  const context = useDialogContext(TRIGGER_NAME, __scopeDialog);

  return (
    <button
      aria-controls={context.contentId}
      aria-expanded={context.open}
      aria-haspopup='dialog'
      data-state={getState(context.open)}
      type='button'
      {...triggerProps}
      onClick={composeEventHandlers(onClick, context.onOpenToggle)}
      ref={forwardedRef}
    />
  );
});

DialogTrigger.displayName = TRIGGER_NAME;

/* -------------------------------------------------------------------------------------------------
 * Dialog Portal
 * -----------------------------------------------------------------------------------------------*/

const PORTAL_NAME = 'DialogPortal';

type PortalContextValue = { forceMount?: true };
const [PortalProvider, usePortalContext] =
  createDialogContext<PortalContextValue>(PORTAL_NAME, {
    forceMount: undefined,
  });

type PortalProps = React.ComponentPropsWithoutRef<typeof Portal>;

interface DialogPortalProps {
  children?: React.ReactNode;
  /**
   * Specify a container element to portal the content info.
   */
  container?: PortalProps['container'];
  /**
   * Used to force mounting when more control is needed. Useful when controlling
   * animation with React animation libraries.
   */
  forceMount?: true;
}

const DialogPortal: React.FunctionComponent<DialogPortalProps> = (
  props: ScopedProps<DialogPortalProps>,
) => {
  const { __scopeDialog, children, container, forceMount } = props;
  const context = useDialogContext(PORTAL_NAME, __scopeDialog);

  return (
    <PortalProvider
      forceMount={forceMount}
      scope={__scopeDialog}
    >
      {React.Children.map(children, (child) => (
        <Presence present={forceMount || context.open}>
          <Portal container={container}>{child}</Portal>
        </Presence>
      ))}
    </PortalProvider>
  );
};

DialogPortal.displayName = PORTAL_NAME;

/* -------------------------------------------------------------------------------------------------
 * Dialog Overlay
 * -----------------------------------------------------------------------------------------------*/

const OVERLAY_NAME = 'DialogOverlay';

type DialogOverlayElement = DialogOverlayImplementationElement;
interface DialogOverlayProps extends DialogOverlayImplementationProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: boolean;
}

const DialogOverlay = React.forwardRef<
  DialogOverlayElement,
  DialogOverlayProps
>((props: ScopedProps<DialogOverlayProps>, forwardedRef) => {
  const { __scopeDialog, forceMount, ...dialogOverlayProps } = props;
  const context = useDialogContext(OVERLAY_NAME, __scopeDialog);

  return context.modal ? (
    <Presence present={forceMount || context.open}>
      <DialogOverlayImplementation
        {...dialogOverlayProps}
        ref={forwardedRef}
      />
    </Presence>
  ) : null;
});

DialogOverlay.displayName = OVERLAY_NAME;

type DialogOverlayImplementationElement = React.ElementRef<'div'>;
interface DialogOverlayImplementationProps
  extends React.ComponentPropsWithoutRef<'div'> {}

const DialogOverlayImplementation = React.forwardRef<
  DialogOverlayImplementationElement,
  DialogOverlayImplementationProps
>((props: ScopedProps<DialogOverlayImplementationProps>, forwardedRef) => {
  const { __scopeDialog, ...dialogOverlayImplementationProps } = props;
  const context = useDialogContext(OVERLAY_NAME, __scopeDialog);

  return (
    <div
      data-state={getState(context.open)}
      {...dialogOverlayImplementationProps}
      ref={forwardedRef}
      style={{
        pointerEvents: 'all',
        ...dialogOverlayImplementationProps.style,
      }}
    />
  );
});

/* -------------------------------------------------------------------------------------------------
 * Dialog Content
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'DialogContent';

type DialogContentElement = DialogContentTypeElement;
interface DialogContentProps extends DialogContentTypeProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true;
}

const DialogContent = React.forwardRef<
  DialogContentElement,
  DialogContentProps
>((props: ScopedProps<DialogContentProps>, forwardedRef) => {
  const portalContext = usePortalContext(CONTENT_NAME, props.__scopeDialog);
  const { forceMount = portalContext.forceMount, ...contentProps } = props;
  const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);

  return (
    <Presence present={forceMount || context.open}>
      {context.modal ? null : null}
    </Presence>
  );
});

/* -----------------------------------------------------------------------------------------------*/

type DialogContentTypeElement = DialogContentImplementationElement;

const DialogContentModal = React.forwardRef<>(() => {});

/* -----------------------------------------------------------------------------------------------*/

type DialogContentImplementationElement = React.ElementRef<
  typeof DismissibleLayer
>;

const DialogContentImplementation = React.forwardRef<>(() => {});

/* -----------------------------------------------------------------------------------------------*/

function getState(open: boolean) {
  return open ? 'open' : 'closed';
}
