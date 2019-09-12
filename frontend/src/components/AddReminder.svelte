<script>
  import { createEventDispatcher } from "svelte";
  import { addDays } from "date-fns";

  import Modal from "./UI/Modal.svelte";
  import {
    SCHEDULE_REMINDER_MUTATION,
    INTERVAL_REMINDER_MUTATION,
    DELAYED_INTERVAL_REMINDER_MUTATION
  } from "../graphql/mutations";
  import { exec } from "../graphql/client";

  const dispatch = createEventDispatcher();

  const tomorrow = addDays(new Date(), 1);

  let remRadioType1,
    remRadioType2,
    remRadioType3,
    remMessage = "",
    schedDay = tomorrow.getDate(),
    schedMonth = tomorrow.getMonth() + 1,
    schedYear = tomorrow.getFullYear(),
    schedHour = "10",
    schedMinute = "00",
    intervalDay = tomorrow.getDate(),
    intervalMonth = tomorrow.getMonth() + 1,
    intervalYear = tomorrow.getFullYear(),
    intervalHour = "10",
    intervalMinute = "00",
    cronInterval = "0 10 1 * *",
    errorMessage = "",
    loading = false,
    everyNum = "5",
    everyStr = "days";

  async function submitForm() {
    errorMessage = "";
    loading = true;
    try {
      if (
        !remRadioType1.checked &&
        !remRadioType2.checked &&
        !remRadioType3.checked
      ) {
        errorMessage = "Select a reminder type!";
      } else if (!remMessage) {
        errorMessage = "Reminder message is empty!";
      } else if (remRadioType1.checked) {
        const when = new Date(
          schedYear,
          schedMonth - 1,
          schedDay,
          schedHour,
          schedMinute
        );
        const res = await exec({
          query: SCHEDULE_REMINDER_MUTATION,
          variables: { text: remMessage, when }
        });
        if (res.errors) {
          errorMessage = res.errors[0].message;
        } else if (!res.data) {
          errorMessage = "An error occurred!";
        }
      } else if (remRadioType2.checked) {
        if (
          (everyStr.startsWith("second") && everyNum < 1800) ||
          (everyStr.startsWith("minute") && everyNum < 30)
        ) {
          errorMessage = "Interval too small!";
        } else {
          const from = new Date(
            intervalYear,
            intervalMonth - 1,
            intervalDay,
            intervalHour,
            intervalMinute
          );
          const interval = `${everyNum} ${everyStr}`;
          const res = await exec({
            query: DELAYED_INTERVAL_REMINDER_MUTATION,
            variables: { text: remMessage, interval, from }
          });
          if (res.errors) {
            errorMessage = res.errors[0].message;
          } else if (!res.data) {
            errorMessage = "An error occurred!";
          }
        }
      } else if (remRadioType3.checked) {
        const res = await exec({
          query: INTERVAL_REMINDER_MUTATION,
          variables: { text: remMessage, interval: cronInterval }
        });
        if (res.errors) {
          errorMessage = res.errors[0].message;
        } else if (!res.data) {
          errorMessage = "An error occurred!";
        }
      }
    } catch (error) {
      console.log(error);
      errorMessage = "An error occurred!";
    }
    loading = false;
    if (!errorMessage) {
      dispatch("save");
    }
  }

  function cancel() {
    dispatch("cancel");
  }
</script>

<style>
  form {
    width: 100%;
  }
</style>

<Modal title="Add Reminder" on:cancel>
  <form on:submit={submitForm}>
    <h3>Choose and set a reminder type:</h3>
    <div class="mt-4">
      <input
        type="radio"
        name="reminder-type"
        id="type1"
        value="small"
        bind:this={remRadioType1} />
      <label for="type1">Schedule</label>
      <p>
        On
        <input
          type="text"
          placeholder="Year"
          class="ml-4 w-12 text-center"
          bind:value={schedYear} />
        /
        <input
          type="text"
          placeholder="month"
          class="w-8 text-center"
          bind:value={schedMonth} />
        /
        <input
          type="text"
          placeholder="day"
          class="w-8 text-center"
          bind:value={schedDay} />
        at
        <input
          type="text"
          placeholder="hour"
          class="w-8 text-center"
          bind:value={schedHour} />
        :
        <input
          type="text"
          placeholder="minute"
          class="w-8 text-center"
          bind:value={schedMinute} />
      </p>
    </div>
    <div class="mt-4">
      <input
        type="radio"
        name="reminder-type"
        id="type2"
        value="medium"
        bind:this={remRadioType2} />
      <label for="type2">Interval</label>
      <p>
        From
        <input
          type="text"
          placeholder="Year"
          class="ml-4 w-12 text-center"
          bind:value={intervalYear} />
        /
        <input
          type="text"
          placeholder="month"
          class="w-8 text-center"
          bind:value={intervalMonth} />
        /
        <input
          type="text"
          placeholder="day"
          class="w-8 text-center"
          bind:value={intervalDay} />
        at
        <input
          type="text"
          placeholder="hour"
          class="w-8 text-center"
          bind:value={intervalHour} />
        :
        <input
          type="text"
          placeholder="minute"
          class="w-8 text-center"
          bind:value={intervalMinute} />
        every
        <input
          type="text"
          placeholder="time"
          class="w-8 text-center"
          bind:value={everyNum} />
        <select bind:value={everyStr}>
          <option value="seconds">seconds</option>
          <option value="minutes">minutes</option>
          <option value="days">days</option>
          <option value="weeks">weeks</option>
          <option value="months">months</option>
          <option value="years">years</option>
        </select>
      </p>
    </div>
    <div class="mt-4">
      <input
        type="radio"
        name="reminder-type"
        id="type3"
        value="medium"
        bind:this={remRadioType3} />
      <label for="type3">Cron Interval</label>
      <p>
        <input
          type="text"
          placeholder="crontab line"
          class="w-48 text-center"
          bind:value={cronInterval} />
      </p>
    </div>
    <div class="mt-4">
      <textarea
        class="w-full h-full border border-solid border-primary-normal radius"
        name="reminder-message"
        id="reminder-message"
        placeholder="Reminder message"
        bind:value={remMessage} />
    </div>
  </form>
  <div slot="footer">
    <button class="btn btn-outline" on:click={cancel} disabled={loading}>
      Close
    </button>
    <button class="btn btn-outline" on:click={submitForm} disabled={loading}>
      Add
    </button>
    <label class="ml-4 text-red-600">{errorMessage}</label>
  </div>
</Modal>
