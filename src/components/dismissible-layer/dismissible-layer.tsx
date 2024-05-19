import React from 'react';

import { useComposedRefs } from '@/lib/composers/ref';

import { ComponentPropsWithoutRef, Primitive } from '../primitive/primitive';

/* -----------------------------------------------------------------------------
 * Dismissible Layer
 *
 * A layer that allow the user to navigate through a additional layer that pops
 * up on the screen and also disable their interactions outside the layer.
 * -----------------------------------------------------------------------------*/

const DISMISSIBLE_LAYER_NAME = 'DismissibleLayer';

let originalBodyPointerEvents: string;

const DismissibleLayerContext = React.createContext({
  branches: new Set(),
  layers: new Set<DismissibleLayerElement>(),
  layersWithOutsidePointerEventsDisabled: new Set<DismissibleLayerElement>(),
});

type DismissibleLayerElement = React.ElementRef<typeof Primitive.div>;
type PrimitiveDivProps = ComponentPropsWithoutRef<typeof Primitive.div>;

const DismissibleLayer = React.forwardRef<DismissibleLayerElement, any>(
  (props, forwardedRef) => {
    const { ...layerProps } = props;

    return (
      // eslint-disable-next-line react/jsx-pascal-case
      <Primitive.div
        {...layerProps}
        ref={forwardedRef}
      />
    );
  },
);

DismissibleLayer.displayName = DISMISSIBLE_LAYER_NAME;

/* -----------------------------------------------------------------------------
 * Dismissible Layer Branch
 *
 *
 * -----------------------------------------------------------------------------*/

const BRANCH_NAME = 'DismissibleLayerBranch';

type DismissibleLayerBranchElement = React.ElementRef<typeof Primitive.div>;
interface DismissibleLayerBranchProps extends PrimitiveDivProps {}

const DismissibleLayerBranch = React.forwardRef<
  DismissibleLayerBranchElement,
  DismissibleLayerBranchProps
>((props, forwardedRef) => {
  const { ...branchProps } = props;

  const context = React.useContext(DismissibleLayerContext);
  const ref = React.useRef<DismissibleLayerBranchElement>(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);

  React.useEffect(() => {
    const node = ref.current;

    if (node) {
      context.branches.add(node);
      return () => {
        context.branches.delete(node);
      };
    }
  }, [context.branches]);

  return (
    <Primitive.div
      {...branchProps}
      ref={composedRefs}
    />
  );
});

DismissibleLayerBranch.displayName = BRANCH_NAME;
