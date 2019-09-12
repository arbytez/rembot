import { writable } from 'svelte/store';

const remindersStore = writable([]);

const customRemindersStore = {
  subscribe: remindersStore.subscribe,
  setReminders: remindersState => {
    remindersStore.set(remindersState);
  },
  addReminder: reminderData => {
    remindersStore.update(reminders => {
      return [reminderData, ...reminders];
    });
  },
  removeReminder: id => {
    remindersStore.update(items => {
      return items.filter(i => i.id !== id);
    });
  },
  disableReminder: id => {
    remindersStore.update(items => {
      const updatedReminders = [...items];
      const reminderIndex = items.findIndex(i => i.id === id);
      updatedReminders[reminderIndex].disabled = true;
      return updatedReminders;
    });
  },
  enableReminder: id => {
    remindersStore.update(items => {
      const updatedReminders = [...items];
      const reminderIndex = items.findIndex(i => i.id === id);
      updatedReminders[reminderIndex].disabled = false;
      return updatedReminders;
    });
  },
  updateReminder: reminderData => {
    remindersStore.update(items => {
      const updatedReminders = [...items];
      const reminderIndex = items.findIndex(i => i.id === reminderData.id);
      updatedReminders[reminderIndex] = reminderData;
      return updatedReminders;
    });
  }
};

export default customRemindersStore;
