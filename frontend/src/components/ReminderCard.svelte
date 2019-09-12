<script>
  import { createEventDispatcher } from "svelte";
  import { format, distanceInWordsToNow } from "date-fns";
  import feather from "feather-icons";

  import { exec } from "../graphql/client";
  import {
    DISABLE_REMINDER_MUTATION,
    ENABLE_REMINDER_MUTATION,
    REMOVE_REMINDER_MUTATION
  } from "../graphql/mutations";
  import remindersStore from "../stores/reminders-store";
  import remCounterStore from "../stores/remCounter-store";
  import currentPageStore from "../stores/currentPage-store";
  import DoubleBounce from "../components/UI/Loaders/DoubleBounce.svelte";

  export let reminderData;
  export let reminderNum;
  export let remindersTot;

  const dispatch = createEventDispatcher();

  let loading = false;

  function handleDisable(e) {
    loading = true;
    exec({
      query: DISABLE_REMINDER_MUTATION,
      variables: { remId: reminderData.id }
    })
      .then(({ data }) => {
        if (data && data.disableReminder) {
          remindersStore.disableReminder(reminderData.id);
        }
        loading = false;
      })
      .catch(err => {
        console.log(err);
        loading = false;
      });
  }

  function handleEnable(e) {
    loading = true;
    exec({
      query: ENABLE_REMINDER_MUTATION,
      variables: { remId: reminderData.id }
    })
      .then(({ data }) => {
        if (data && data.enableReminder) {
          remindersStore.enableReminder(reminderData.id);
        }
        loading = false;
      })
      .catch(err => {
        console.log(err);
        loading = false;
      });
  }
</script>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(
      auto-fit,
      minmax(50px, 1fr)
    ); /* 1fr 1fr 1fr; */
    grid-template-rows: repeat(
      auto-fit,
      minmax(50px, 1fr)
    ); /*1fr 1fr 1fr 1fr;*/
    grid-column-gap: 0px;
    grid-row-gap: 0px;
  }
  .rem-disabled {
    grid-area: 1 / 3 / 2 / 4;
    justify-self: end;
  }
  .rem-text {
    grid-area: 1 / 1 / 2 / 3;
    overflow: auto;
  }
  .rem-nextrun {
    grid-area: 2 / 1 / 3 / 4;
  }
  .rem-lastrun {
    grid-area: 3 / 1 / 4 / 4;
  }
  .rem-buttons {
    grid-area: 4 / 1 / 5 / 4;
  }
</style>

<div
  class="grid my-4 p-4 border-4 border-solid border-primay-darker rounded
  shadow-xl">
  <div class="rem-text">
    <strong>Message:</strong>
    <p>{reminderData.text}</p>
  </div>
  <div class="rem-nextrun">
    <strong>Next run:</strong>
     {format(reminderData.nextRunAt, 'ddd MMM DD YYYY HH:mm:ss')} (in {distanceInWordsToNow(reminderData.nextRunAt)})
  </div>
  <div class="rem-lastrun">
    <strong>Last run:</strong>
    {#if reminderData.lastRunAt}
      {format(reminderData.lastRunAt, 'ddd MMM DD YYYY HH:mm:ss')} ({distanceInWordsToNow(reminderData.lastRunAt)}
      ago)
    {:else}--{/if}
  </div>
  <div class="rem-disabled text-right">
    <p class="px-1 mr-2">{reminderNum} / {remindersTot}</p>
    {#if reminderData.disabled}
      <span
        class="flex justify-center items-center bg-yellow-500 border
        border-solid border-yellow-800 radius px-1 text-white text-sm font-bold
        tracking-wider mr-2">
        <i class="mr-1">
          {@html feather.icons['pause-circle'].toSvg({
            width: '1.2rem',
            height: '1.2rem'
          })}
        </i>
        <span>DISABLED</span>
      </span>
    {/if}
  </div>
  <div class="rem-buttons flex flex-wrap justify-start items-center">
    {#if reminderData.disabled}
      <button
        class="btn btn-outline my-2 w-24 h-10 flex justify-center items-center
        my-2 mr-1"
        on:click={handleEnable}
        disabled={loading}>
        {#if loading}
          <DoubleBounce size="1.3rem" background="#7999d2" />
        {:else}
          <i class="mr-2">
            {@html feather.icons['play-circle'].toSvg()}
          </i>
          <span>Enable</span>
        {/if}
      </button>
    {:else}
      <button
        class="btn btn-outline my-2 w-24 h-10 flex justify-center items-center
        my-2 mr-1"
        on:click={handleDisable}
        disabled={loading}>
        {#if loading}
          <DoubleBounce size="1.3rem" background="#7999d2" />
        {:else}
          <i class="mr-2">
            {@html feather.icons['stop-circle'].toSvg()}
          </i>
          <span>Disable</span>
        {/if}
      </button>
    {/if}

    <button
      class="btn btn-outline my-2 w-24 h-10 flex justify-center items-center
      my-2"
      on:click={() => dispatch('remove', reminderData.id)}
      disabled={loading}>
      {#if loading}
        <DoubleBounce size="1.3rem" background="#7999d2" />
      {:else}
        <i class="mr-2">
          {@html feather.icons['x-circle'].toSvg()}
        </i>
        <span>Remove</span>
      {/if}
    </button>
  </div>
</div>
