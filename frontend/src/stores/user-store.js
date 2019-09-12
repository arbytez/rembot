import { writable } from 'svelte/store';

const user = writable(false);

const customUser = {
  subscribe: user.subscribe,
  setUser: userState => {
    user.set(userState);
  },
  resetUser: () => {
    user.update(() => false);
  }
};

export default customUser;
