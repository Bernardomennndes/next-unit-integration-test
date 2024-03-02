import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { Slot, Slottable } from './slot';

/**
 * For the `Slot` component, it should be tested if the component can turn into
 * their child and pass the properties to the new rendered component. Also, its
 * necessary that the props passed to `Slot` do not override the child's
 * properties, but be added to them.
 *
 * For the `Slot` component, with the use of `Slottable`, it should be tested if
 * a custom component with `Slottable` within their children renders all of the
 * others nested `Slot` components inside the child of `Slottable`. It should
 * throw an error if more than one component is located inside `Slot`, when not
 * wrapped around `Slottable` (must have only one child).
 */

describe('given a slotted Trigger', () => {
  describe('with onClick on itself', () => {
    const handleClick = jest.fn();

    beforeEach(() => {
      handleClick.mockClear();
    });

    it('should call the onClick passed to the Trigger', async () => {
      render(
        <Trigger
          as={Slot}
          onClick={handleClick}
        >
          <button>Click me</button>
        </Trigger>,
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('with onClick on the child', () => {
    const handleClick = jest.fn();

    beforeEach(() => {
      handleClick.mockClear();
    });

    it("should call child's onClick", () => {
      render(
        <Trigger as={Slot}>
          <button
            onClick={handleClick}
            type='button'
          >
            Click Me
          </button>
        </Trigger>,
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('with onClick on itself AND the child', () => {
    const handleTriggerClick = jest.fn();
    const handleChildClick = jest.fn();

    beforeEach(() => {
      handleTriggerClick.mockClear();
      handleChildClick.mockClear();

      render(
        <Trigger
          as={Slot}
          onClick={handleTriggerClick}
        >
          <button type='button'>Click Me</button>
        </Trigger>,
      );

      fireEvent.click(screen.getByRole('button'));
    });

    it("should call the Trigger's onClick", () => {
      expect(handleTriggerClick).toHaveBeenCalledTimes(1);
    });

    it("should call the child's onClick", () => {
      expect(handleChildClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('with onClick on itself AND undefined onClick on the child', () => {
    const handleTriggerClick = jest.fn();

    beforeEach(() => {
      handleTriggerClick.mockClear();
    });

    it("should call the Trigger's onClick", () => {
      render(
        <Trigger
          as={Slot}
          onClick={handleTriggerClick}
        >
          <button
            onClick={undefined}
            type='button'
          >
            Click Me
          </button>
        </Trigger>,
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleTriggerClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('with undefined onClick on itself AND onClick on the child', () => {
    const handleChildClick = jest.fn();

    beforeEach(() => {
      handleChildClick.mockClear();
    });

    it("should call the child's onClick", () => {
      render(
        <Trigger
          as={Slot}
          onClick={undefined}
        >
          <button
            onClick={handleChildClick}
            type='button'
          >
            Click Me
          </button>
        </Trigger>,
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleChildClick).toHaveBeenCalledTimes(1);
    });
  });
});

describe('given a Button with Slottable', () => {
  describe('without asChild', () => {
    it('should render a button with icon on the left/right', async () => {
      const { container } = render(
        <Button
          iconLeft={<span>left</span>}
          iconRight={<span>right</span>}
        >
          Button <em>text</em>
        </Button>,
      );

      expect(container).toMatchSnapshot();
    });
  });

  describe('with asChild', () => {
    it('should render a button with icon on the left/right', () => {
      const { container } = render(
        <Button
          asChild
          iconLeft={<span>left</span>}
          iconRight={<span>right</span>}
        >
          <a href='/'>
            Button <em>text</em>
          </a>
        </Button>,
      );

      expect(container).toMatchSnapshot();
    });
  });
});

type TriggerProps = React.ComponentPropsWithRef<'button'> & {
  as: React.ElementType;
};

const Trigger = ({
  as: Component = 'button',
  ...triggerProps
}: TriggerProps) => <Component {...triggerProps} />;

type ButtonElement = React.ElementRef<'button'>;

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  asChild?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

const Button = React.forwardRef<ButtonElement, ButtonProps>(
  (props, forwardedRef) => {
    const {
      asChild = false,
      children,
      iconLeft,
      iconRight,
      ...buttonProps
    } = props;

    const Component = asChild ? Slot : 'button';

    return (
      <Component
        {...buttonProps}
        ref={forwardedRef}
      >
        {iconLeft}
        <Slottable>{children}</Slottable>
        {iconRight}
      </Component>
    );
  },
);

Button.displayName = 'Button';
