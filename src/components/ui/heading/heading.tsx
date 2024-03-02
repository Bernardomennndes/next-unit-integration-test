import React from 'react';

import { cn } from '@/lib/utils';

type HeadingElement = React.ElementRef<'h1'>;
type SubtitleElement = React.ElementRef<'p'>;
type WrapperElement = React.ElementRef<'header'>;

interface HeadingProps extends React.ComponentPropsWithoutRef<'h1'> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

interface SubtitleProps extends React.ComponentPropsWithoutRef<'p'> {}

interface WrapperProps extends React.ComponentPropsWithoutRef<'header'> {}

type CompoundedComponent = React.ForwardRefExoticComponent<
  HeadingProps & React.RefAttributes<HeadingElement>
> & {
  Subtitle: React.ForwardRefExoticComponent<
    SubtitleProps & React.RefAttributes<SubtitleElement>
  >;
  Wrapper: React.ForwardRefExoticComponent<
    WrapperProps & React.RefAttributes<WrapperElement>
  >;
};

const Heading = React.forwardRef<HeadingElement, HeadingProps>(
  ({ as: Tag = 'h1', children, className, ...headingProps }, forwardedRef) => {
    return (
      <Tag
        aria-label='Title'
        className={cn('text-3xl font-semi', className)}
        {...headingProps}
        ref={forwardedRef}
      >
        {children}
      </Tag>
    );
  },
) as CompoundedComponent;
Heading.displayName = 'Heading';

Heading.Subtitle = React.forwardRef<SubtitleElement, SubtitleProps>(
  ({ children, ...subtitleProps }, forwardedRef) => {
    return (
      <p
        aria-label='Subtitle'
        className='text-muted-foreground'
        ref={forwardedRef}
        role='doc-subtitle'
        {...subtitleProps}
      >
        {children}
      </p>
    );
  },
);
Heading.Subtitle.displayName = 'Subtitle';

Heading.Wrapper = React.forwardRef<WrapperElement, WrapperProps>(
  ({ children, ...wrapperProps }, forwardedRef) => {
    return (
      <header
        ref={forwardedRef}
        {...wrapperProps}
      >
        {children}
      </header>
    );
  },
);
Heading.Wrapper.displayName = 'Wrapper';

export { Heading };
export type { HeadingProps, SubtitleProps, WrapperProps };
