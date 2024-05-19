import React from 'react';

interface RenderProps {
  children: React.ReactNode;
  fallback?: {
    overlay: React.ReactNode;
    show: boolean;
  };
  view?: boolean;
}

export default function Render({
  children,
  fallback,
  view = true,
}: Readonly<RenderProps>) {
  return fallback?.show ? fallback.overlay : view ? children : null;
}
