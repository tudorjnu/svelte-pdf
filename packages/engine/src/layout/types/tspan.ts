import * as P from '@svelte-pdf/engine/primitives';
import { SafeStyle, StyleProp } from '@svelte-pdf/engine/stylesheet';
import { Paragraph } from '@svelte-pdf/engine/textkit';

import {
  SVGPresentationAttributes,
  SafeSVGPresentationAttributes,
} from './base';
import { SafeTextInstanceNode, TextInstanceNode } from './text-instance';

interface TspanProps extends SVGPresentationAttributes {
  x?: string | number;
  y?: string | number;
}

interface SafeTspanProps extends SafeSVGPresentationAttributes {
  x?: number;
  y?: number;
}

export type TspanNode = {
  type: typeof P.Tspan;
  props: TspanProps;
  style?: StyleProp;
  box?: never;
  origin?: never;
  yogaNode?: never;
  lines?: Paragraph;
  children?: TextInstanceNode[];
};

export type SafeTspanNode = Omit<TspanNode, 'style' | 'props' | 'children'> & {
  style: SafeStyle;
  props: SafeTspanProps;
  children?: SafeTextInstanceNode[];
};
