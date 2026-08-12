import * as P from '@svelte-pdf/engine/primitives';
import { SafeStyle, StyleProp } from '@svelte-pdf/engine/stylesheet';

import {
  SafeSVGPresentationAttributes,
  SVGPresentationAttributes,
} from './base';

interface EllipseProps extends SVGPresentationAttributes {
  style?: SVGPresentationAttributes;
  cx?: string | number;
  cy?: string | number;
  rx: string | number;
  ry: string | number;
}

interface SafeEllipseProps extends SafeSVGPresentationAttributes {
  style?: SafeSVGPresentationAttributes;
  cx?: number;
  cy?: number;
  rx: number;
  ry: number;
}

export type EllipseNode = {
  type: typeof P.Ellipse;
  props: EllipseProps;
  style?: StyleProp;
  box?: never;
  origin?: never;
  yogaNode?: never;
  children?: never[];
};

export type SafeEllipseNode = Omit<EllipseNode, 'style' | 'props'> & {
  style: SafeStyle;
  props: SafeEllipseProps;
};
