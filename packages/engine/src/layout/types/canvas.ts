import * as P from '@svelte-pdf/engine/primitives';
import { SafeStyle, StyleProp } from '@svelte-pdf/engine/stylesheet';

import { YogaNode } from 'yoga-layout/load';

import { Box, NodeProps, Origin } from './base';

interface CanvasProps extends NodeProps {
  paint: (
    painter: any,
    availableWidth?: number,
    availableHeight?: number,
  ) => null;
}

export type CanvasNode = {
  type: typeof P.Canvas;
  props: CanvasProps;
  style?: StyleProp;
  box?: Box;
  origin?: Origin;
  yogaNode?: YogaNode;
  children?: never[];
};

export type SafeCanvasNode = Omit<CanvasNode, 'style'> & {
  style: SafeStyle;
};
