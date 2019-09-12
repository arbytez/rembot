import { writable } from 'svelte/store';

const remCounterStore = writable(0);

const customRemCounterStore = {
  subscribe: remCounterStore.subscribe,
  setCounter: counterData => {
    remCounterStore.set(counterData);
  },
  resetCounter: () => {
    remCounterStore.update(() => 0);
  },
  plus: () => {
    remCounterStore.update(items => items + 1);
  },
  minus: () => {
    remCounterStore.update(items => items - 1);
  }
};

export default customRemCounterStore;
