import { writable } from 'svelte/store';

const currentPageStore = writable(1);

const customCurrentPageStore = {
  subscribe: currentPageStore.subscribe,
  setCurrentPage: counterData => {
    currentPageStore.set(counterData);
  },
  resetCurrentPage: () => {
    currentPageStore.update(() => 1);
  },
  nextPage: () => {
    currentPageStore.update(items => items + 1);
  },
  prevPage: () => {
    currentPageStore.update(items => items - 1);
  }
};

export default customCurrentPageStore;
