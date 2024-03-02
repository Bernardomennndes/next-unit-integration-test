import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '.';

const mockClickFunction = jest.fn();

describe('Button', () => {
  describe('Render', () => {
    it('should be able to render', () => {
      render(<Button />);

      const button = screen.getByRole('button');

      expect(button).toBeInTheDocument();
    });

    it('should be able to render with "Button" text', () => {
      render(<Button>Button</Button>);

      const button = screen.getByRole('button', { name: 'Button' });

      expect(button).toBeInTheDocument();
    });

    it('should be able to be disabled', () => {
      render(<Button disabled />);

      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
    });
  });

  describe('Behavior', () => {
    it('should be able to be clicked', async () => {
      render(<Button onClick={mockClickFunction} />);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(mockClickFunction).toHaveBeenCalled();
    });
  });
});
