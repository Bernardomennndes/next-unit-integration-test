import { render, screen } from '@testing-library/react';

import { Heading } from '.';

describe('Header', () => {
  describe('Render', () => {
    it('should render "Render Test" title', () => {
      render(<Heading title='Render Test'>Render Test</Heading>);

      const header = screen.getByRole('heading', {
        level: 1,
        name: 'Render Test',
      });

      expect(header).toBeInTheDocument();
    });

    it('should render "Bernardo" title', () => {
      render(<Heading title='Bernardo'>Bernardo</Heading>);

      const header = screen.getByRole('heading', {
        level: 1,
        name: 'Bernardo',
      });

      expect(header).toBeInTheDocument();
    });
  });

  describe('Behavior', () => {});
});
