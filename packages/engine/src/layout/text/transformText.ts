import { capitalize, upperFirst } from '@svelte-pdf/engine/fns';
import { SafeStyle } from '@svelte-pdf/engine/stylesheet';

/**
 * Apply transformation to text string
 *
 * @param {string} text
 * @param {string} transformation type
 * @returns {string} transformed text
 */
const transformText = (
  text: string,
  transformation: SafeStyle['textTransform'],
) => {
  switch (transformation) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'capitalize':
      return capitalize(text);
    case 'upperfirst':
      return upperFirst(text);
    default:
      return text;
  }
};

export default transformText;
