import { mount, unmount } from 'svelte';
import queue from 'queue';

import { pdf } from './pdf.js';

const isBrowser = () => typeof document !== 'undefined';

export function usePDF(component, props = {}) {
  const state = $state({
    url: null,
    blob: null,
    loading: false,
    error: null,
  });

  let app = null;
  let target = null;
  let renderQueue = null;

  const render = async (container) => {
    if (!container?.document) return;

    state.loading = true;

    try {
      const instance = pdf(container);
      const blob = await instance.toBlob();

      if (state.url) URL.revokeObjectURL(state.url);

      state.blob = blob;
      state.url = URL.createObjectURL(blob);
      state.error = null;
      state.loading = false;
    } catch (error) {
      state.loading = false;
      state.error = error;
      console.error(error);
      throw error;
    }
  };

  const mountInstance = () => {
    if (!isBrowser()) return;

    const container = {
      type: 'ROOT',
      document: null,
      onChange: () => {
        if (!renderQueue) return;
        renderQueue.splice(0, renderQueue.length, () => render(container));
      },
    };

    target = document.createElement('div');
    target.style.display = 'none';
    document.body.appendChild(target);

    app = mount(component, {
      target,
      props,
      context: new Map([['pdf-container', container]]),
    });

    app.__pdfContainer = container;

    if (!renderQueue) {
      renderQueue = queue({ autostart: true, concurrency: 1 });
      renderQueue.on('error', (error) => {
        state.loading = false;
        state.error = error;
      });
    }

    container.onChange();
  };

  const cleanup = () => {
    renderQueue?.end();
    renderQueue = null;
    if (app) {
      unmount(app);
      app = null;
    }
    if (state.url) {
      URL.revokeObjectURL(state.url);
      state.url = null;
    }
    if (target?.parentNode) {
      target.parentNode.removeChild(target);
      target = null;
    }
  };

  $effect(() => {
    mountInstance();

    return cleanup;
  });

  const update = (nextComponent = component, nextProps = props) => {
    cleanup();
    component = nextComponent;
    props = nextProps;
    mountInstance();
  };

  return {
    get url() {
      return state.url;
    },
    get blob() {
      return state.blob;
    },
    get loading() {
      return state.loading;
    },
    get error() {
      return state.error;
    },
    update,
  };
}

export default usePDF;
