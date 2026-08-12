import * as P from '@svelte-pdf/engine/primitives';
import { SafeStyle, StyleProp } from '@svelte-pdf/engine/stylesheet';

import { NodeProps } from './base';
import { SafeTextInstanceNode, TextInstanceNode } from './text-instance';

export type NoteNode = {
  type: typeof P.Note;
  props: NodeProps;
  style?: StyleProp;
  box?: never;
  origin?: never;
  yogaNode?: never;
  children?: TextInstanceNode[];
};

export type SafeNoteNode = Omit<NoteNode, 'style' | 'children'> & {
  style: SafeStyle;
  children?: SafeTextInstanceNode[];
};
