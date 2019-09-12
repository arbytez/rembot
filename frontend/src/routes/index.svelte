<script>
  import { createEventDispatcher, onMount, onDestroy } from "svelte";

  import userStore from "../stores/user-store";
  import remindersStore from "../stores/reminders-store";
  import remCounterStore from "../stores/remCounter-store";
  import currentPageStore from "../stores/currentPage-store";
  import { exec } from "../graphql/client";
  import { GET_REMINDERS_QUERY } from "../graphql/queries";
  import { REMOVE_REMINDER_MUTATION } from "../graphql/mutations";
  import ReminderCard from "../components/ReminderCard.svelte";
  import AddReminder from "../components/AddReminder.svelte";
  import Stretch from "../components/UI/Loaders/Stretch.svelte";
  import feather from "feather-icons";

  const remindersPerPage = parseInt(process.env.REMINDERS_PER_PAGE);

  let loading = true;
  let addRemMode = false;

  $: canFastPrevPage = $currentPageStore > 2;
  $: canPrevPage = $currentPageStore > 1;
  $: canFastNextPage = $currentPageStore < totRemindersPages - 1;
  $: canNextPage = $currentPageStore < totRemindersPages;
  $: totRemindersPages = Math.ceil($remCounterStore / remindersPerPage) || 1;
  $: skipReminders =
    $currentPageStore > 0 ? ($currentPageStore - 1) * remindersPerPage : 0;

  function updateDataPage() {
    loading = true;
    setTimeout(() => {
      exec({
        query: GET_REMINDERS_QUERY,
        variables: { skip: skipReminders, limit: remindersPerPage }
      })
        .then(({ data }) => {
          if (!data) {
            remindersStore.setReminders([]);
            remCounterStore.resetCounter();
          } else {
            const { getReminders, countReminders } = data;
            remCounterStore.setCounter(countReminders);
            remindersStore.setReminders(getReminders);
          }
          loading = false;
        })
        .catch(error => {
          console.log(error);
          remindersStore.setReminders([]);
          remCounterStore.resetCounter();
          loading = false;
        });
    }, 1);
  }

  function handleRefresh(e) {
    updateDataPage();
  }

  function handleRemove(e) {
    loading = true;
    exec({
      query: REMOVE_REMINDER_MUTATION,
      variables: { remId: e.detail }
    })
      .then(({ data }) => {
        if (data && data.removeReminder) {
          remindersStore.removeReminder(e.detail);
          remCounterStore.minus();
          setTimeout(() => {
            if ($currentPageStore > totRemindersPages) {
              currentPageStore.setCurrentPage(totRemindersPages);
            }
            updateDataPage();
          }, 1);
        } else {
          loading = false;
        }
      })
      .catch(err => {
        console.log(err);
        loading = false;
      });
  }

  function handleAddReminder(e) {
    addRemMode = true;
  }

  function savedReminder(e) {
    addRemMode = false;
    updateDataPage();
  }

  function cancelEdit() {
    addRemMode = false;
  }

  onMount(() => {
    if (!$userStore) return;
    updateDataPage();
  });
</script>

<style>

</style>

<svelte:head>
  <title>Home</title>
</svelte:head>

{#if $userStore}
  {#if addRemMode}
    <AddReminder on:save={savedReminder} on:cancel={cancelEdit} />
  {/if}
  <div class="mx-auto sm:p-4">
    <div class="flex flex-wrap justify-between items-center">
      <p class="my-2">
        You have
        <strong>{$remCounterStore}</strong>
        reminder{$remCounterStore !== 1 ? 's' : ''}! Page {$currentPageStore} / {totRemindersPages}

      </p>
      <div class="flex justify-between items-center flex-wrap">
        <button
          class="btn btn-primary flex justify-center items-center mr-1 my-2"
          on:click={handleAddReminder}
          disabled={loading}>
          <i class="mr-2">
            {@html feather.icons['plus-circle'].toSvg()}
          </i>
          <span>Add reminder</span>
        </button>
        <button
          class="btn btn-primary flex justify-center items-center my-2"
          on:click={handleRefresh}
          disabled={loading}>
          <i>
            {@html feather.icons['refresh-cw'].toSvg()}
          </i>
        </button>
      </div>
    </div>

    {#if $remCounterStore > 0}
      <div class="flex flex-wrap justify-between items-center">
        <button
          class="btn btn-outline my-1"
          disabled={loading}
          on:click={() => {
            if ($currentPageStore !== 1) {
              currentPageStore.setCurrentPage(1);
              updateDataPage();
            }
          }}>
           {'<<'}
        </button>
        <button
          class="btn btn-outline my-1"
          disabled={loading}
          on:click={() => {
            if ($currentPageStore > 1) {
              currentPageStore.prevPage();
              updateDataPage();
            }
          }}>
           {'<'}
        </button>

        {#if loading}
          <div style="opacity: 1" class="my-1">
            <Stretch size="3rem" background="#7999d2" />
          </div>
        {:else}
          <div style="opacity: 0" class="my-1">
            <Stretch size="3rem" background="#7999d2" />
          </div>
        {/if}

        <button
          class="btn btn-outline my-1"
          disabled={loading}
          on:click={() => {
            if ($currentPageStore < totRemindersPages) {
              currentPageStore.nextPage();
              updateDataPage();
            }
          }}>
           {'>'}
        </button>
        <button
          class="btn btn-outline my-1"
          disabled={loading}
          on:click={() => {
            if ($currentPageStore !== totRemindersPages) {
              currentPageStore.setCurrentPage(totRemindersPages);
              updateDataPage();
            }
          }}>
           {'>>'}
        </button>
      </div>
    {/if}

    {#each $remindersStore as reminder, i (reminder.id)}
      <ReminderCard
        reminderData={reminder}
        reminderNum={`${($currentPageStore - 1) * remindersPerPage + i + 1}`}
        remindersTot={$remCounterStore}
        on:remove={handleRemove} />
    {/each}
  </div>
{:else}
  <div class="flex justify-center items-center w-full h-48 text-2xl font-bold">
    Invalid url or session expired!
  </div>
{/if}
