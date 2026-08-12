import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));

const wasmPath = resolve(
  __dirname,
  '../../../node_modules/yoga-layout/dist/binaries/yoga-wasm-base64-esm.js',
);

let libPromise;

async function loadLib() {
  if (!libPromise) {
    libPromise = (async () => {
      let wasmSource = readFileSync(wasmPath, 'utf-8');
      wasmSource = wasmSource
        .replace(
          /import\.meta\.url/g,
          "'file:///node_modules/yoga-layout/dist/binaries/yoga-wasm-base64-esm.js'",
        )
        .replace(/export\s+default\s+loadYoga\s*;?/, '');

      const context = {
        console,
        WebAssembly,
        Buffer,
        Uint8Array,
        Int8Array,
        Int16Array,
        Int32Array,
        Uint16Array,
        Uint32Array,
        Float32Array,
        Float64Array,
        ArrayBuffer,
        Promise,
        setTimeout,
        clearTimeout,
        Error,
        TypeError,
        RangeError,
        Object,
        Array,
        String,
        Number,
        Boolean,
        Date,
        RegExp,
        Map,
        Set,
        WeakMap,
        WeakSet,
        Symbol,
        Reflect,
        JSON,
        Math,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        encodeURI,
        decodeURI,
        encodeURIComponent,
        decodeURIComponent,
        escape,
        unescape,
        globalThis: {},
      };
      context.globalThis = context;

      const loadYoga = runInNewContext(wasmSource + '\nloadYoga', context, {
        filename: 'yoga-wasm-base64-esm.js',
      });

      return loadYoga();
    })();
  }
  return libPromise;
}

const { default: wrapAssembly } = await import(
  '../../../node_modules/yoga-layout/dist/src/wrapAssembly.js'
);

export const loadYoga = async () => wrapAssembly(await loadLib());
export * from '../../../node_modules/yoga-layout/dist/src/generated/YGEnums.js';
