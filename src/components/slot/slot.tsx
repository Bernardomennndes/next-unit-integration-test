import * as React from 'react';

import { composeRefs } from '@/lib/composers/ref';

/* -------------------------------------------------------------------------------------------------
 * Slot
 * -----------------------------------------------------------------------------------------------*/

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

/**
 * A component that clones the first of their children that is nested inside the
 * sub component `Slottable` and render the rest of them inside the nested `Slottable`
 * [only] child component. If more than one child is passed inside the `Slottable`
 * component, or the `Slot` component itself, an error will be thrown and the children
 * will not be rendered.
 */
const Slot = React.forwardRef<HTMLElement, SlotProps>((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  const childrenArray = React.Children.toArray(children);
  // Find the first `Slottable` component nested inside the `Slot` component
  const slottable = childrenArray.find(isSlottable);

  if (slottable) {
    // The new element to render is the one passed as a child of `Slottable`
    const newElement = slottable.props.children as React.ReactNode;

    // All the elements inside `Slot` will be rendered as children of the nested
    // component inside `Slottable`, with they respective declared order
    const newChildren = childrenArray.map((child) => {
      if (child === slottable) {
        // Because the new element will be the one rendered, we are only interested
        // in grabbing its children (`newElement.props.children`)

        if (React.Children.count(newElement) > 1)
          return React.Children.only(null);

        return React.isValidElement(newElement)
          ? (newElement.props.children as React.ReactNode)
          : null;
      }

      return child;
    });

    return (
      <SlotClone
        {...slotProps}
        ref={forwardedRef}
      >
        {React.isValidElement(newElement)
          ? React.cloneElement(newElement, undefined, newChildren)
          : null}
      </SlotClone>
    );
  }

  return (
    <SlotClone
      {...slotProps}
      ref={forwardedRef}
    >
      {children}
    </SlotClone>
  );
});

Slot.displayName = 'Slot';

/* -------------------------------------------------------------------------------------------------
 * Slot Clone
 * -----------------------------------------------------------------------------------------------*/

interface SlotCloneProps {
  children: React.ReactNode;
}

/**
 * A component that verifies if the nested child is a valid react component, and
 * if there is more than one child, no components are rendered.
 */
const SlotClone = React.forwardRef<HTMLElement, SlotCloneProps>(
  (props, forwardedRef) => {
    const { children, ...slotProps } = props;

    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...mergeProps(slotProps, children.props),
        ref: forwardedRef
          ? composeRefs(forwardedRef, (children as any).ref)
          : (children as any).ref,
      });
    }

    return React.Children.count(children) > 1
      ? React.Children.only(null)
      : null;
  },
);

SlotClone.displayName = 'SlotClone';

/* -------------------------------------------------------------------------------------------------
 * Slottable
 * -----------------------------------------------------------------------------------------------*/

const Slottable = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

/* ---------------------------------------------------------------------------------------------- */

type AnyProps = Record<PropertyKey, any>;

/**
 * Check if the component is a valid React.ReactElement and compares if
 * it is the same type as the `Slottable` component, meaning that the nested child
 * component is able to be rendered as the parent component.
 */
function isSlottable(
  component: React.ReactNode,
): component is React.ReactElement {
  return React.isValidElement(component) && component.type === Slottable;
}

function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  // All child props should override
  const overrideProps = { ...childProps };

  Object.keys(childProps).forEach((propName) => {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];

    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      // If handler exists in both, they're composed
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          slotPropValue(...args);
          childPropValue(...args);
        };
      }
      // If only exists only on the slot, then its used
      else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    }
    // If it is a `style` or `className`, its merged
    else if (propName === 'style') {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === 'className') {
      overrideProps[propName] = [slotPropValue, childPropValue]
        .filter(Boolean)
        .join(' ');
    }
  });

  return { ...slotProps, ...overrideProps };
}

const Root = Slot;

export { Root, Slot, Slottable };

export type { SlotProps };
