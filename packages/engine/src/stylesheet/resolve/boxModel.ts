import parse from 'postcss-value-parser/lib/parse.js';
import parseUnit from 'postcss-value-parser/lib/unit.js';

import transformUnit from '../utils/units';
import { Container } from '../types';

const BOX_MODEL_UNITS = new Set([
  'px',
  'in',
  'mm',
  'cm',
  'pt',
  '%',
  'vw',
  'vh',
  'rem',
  '',
]);

interface ParseValue {
  type: string;
  value: string;
}

type BoxModelSide = 'top' | 'right' | 'bottom' | 'left';

const logError = (style: string | number | symbol, value: unknown) => {
  const name = style.toString();

  // eslint-disable-next-line no-console
  console.error(`
    @svelte-pdf/engine/stylesheet parsing error:
    ${name}: ${value},
    ${' '.repeat(name.length + 2)}^
    Unsupported ${name} value format
  `);
};

const getObjectKeys = (model: string): BoxModelSide[] | null => {
  if (model === 'padding' || model === 'margin') {
    return ['top', 'right', 'bottom', 'left'];
  }

  if (model === 'paddingVertical' || model === 'marginVertical') {
    return ['top', 'bottom'];
  }

  if (model === 'paddingHorizontal' || model === 'marginHorizontal') {
    return ['right', 'left'];
  }

  const match = model.match(/^(padding|margin)(Top|Right|Bottom|Left)$/);

  if (match) {
    const side = match[2].toLowerCase() as BoxModelSide;
    return [side];
  }

  return null;
};

const parseBoxModelValue = (
  model: string | number | symbol,
  value: unknown,
  container: Container,
  autoSupported: boolean,
): number | string | null => {
  const nodes: ParseValue[] = parse(`${value}`);

  const parts: string[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    // value contains `calc`, `url` or other css function
    // `,`, `/` or strings that unsupported by margin and padding
    if (
      node.type === 'function' ||
      node.type === 'string' ||
      node.type === 'div'
    ) {
      return null;
    }

    if (node.type === 'word') {
      if (node.value === 'auto' && autoSupported) {
        parts.push(node.value);
      } else {
        const result = parseUnit(node.value);

        // when unit isn't specified this condition is true
        if (result && BOX_MODEL_UNITS.has(result.unit)) {
          parts.push(node.value);
        } else {
          return null;
        }
      }
    }
  }

  if (parts.length === 0 || parts.length > 1) {
    return null;
  }

  return transformUnit(container, parts[0]) as number | string;
};

/**
 * @param options
 * @param [options.expandsTo]
 * @param [options.maxValues]
 * @param [options.autoSupported]
 */
const expandBoxModel =
  <S, E>({
    expandsTo,
    maxValues = 1,
    autoSupported = false,
  }: {
    expandsTo?: ({ first, second, third, fourth }: Record<string, number>) => E;
    maxValues?: number;
    autoSupported?: boolean;
  } = {}) =>
  <K extends keyof S>(model: K, value: S[K], container: Container) => {
    const objectKeys = getObjectKeys(model as string);

    const isPlainObject =
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      objectKeys !== null &&
      objectKeys.some((key) => key in value);

    if (isPlainObject) {
      const values = objectKeys.map((key) =>
        key in value
          ? parseBoxModelValue(
              model,
              (value as Record<string, unknown>)[key],
              container,
              autoSupported,
            )
          : 0,
      );

      if (values.some((v) => v === null)) {
        logError(model, value);

        return {} as E;
      }

      const typedValues = values as (number | string)[];
      const first = typedValues[0];

      if (expandsTo) {
        const second = typedValues[1] ?? first;
        const third = typedValues[2] ?? first;
        const fourth = typedValues[3] ?? second;

        return expandsTo({ first, second, third, fourth });
      }

      return {
        [model]: first,
      } as E;
    }

    const nodes: ParseValue[] = parse(`${value}`);

    const parts: string[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // value contains `calc`, `url` or other css function
      // `,`, `/` or strings that unsupported by margin and padding
      if (
        node.type === 'function' ||
        node.type === 'string' ||
        node.type === 'div'
      ) {
        logError(model, value);

        return {} as E;
      }

      if (node.type === 'word') {
        if (node.value === 'auto' && autoSupported) {
          parts.push(node.value);
        } else {
          const result = parseUnit(node.value);

          // when unit isn't specified this condition is true
          if (result && BOX_MODEL_UNITS.has(result.unit)) {
            parts.push(node.value);
          } else {
            logError(model, value);

            return {} as E;
          }
        }
      }
    }

    // checks that we have enough parsed values
    if (parts.length > maxValues) {
      logError(model, value);

      return {} as E;
    }

    const first = transformUnit(container, parts[0]) as number;

    if (expandsTo) {
      const second = transformUnit(container, parts[1] || parts[0]) as number;
      const third = transformUnit(container, parts[2] || parts[0]) as number;
      const fourth = transformUnit(
        container,
        parts[3] || parts[1] || parts[0],
      ) as number;

      return expandsTo({ first, second, third, fourth });
    }

    return {
      [model]: first,
    } as E;
  };

export default expandBoxModel;
