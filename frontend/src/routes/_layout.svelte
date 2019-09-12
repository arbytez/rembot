<script>
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { goto } from "@sapper/app";

  import { exec } from "../graphql/client";
  import { ME_QUERY } from "../graphql/queries";
  import { LOGIN_MUTATION } from "../graphql/mutations";
  import Nav from "../components/Nav.svelte";
  import Header from "../components/UI/Header.svelte";
  import Stretch from "../components/UI/Loaders/Stretch.svelte";
  import userStore from "../stores/user-store";

  export let segment;

  let userParamUrl, tokenParamUrl;
  let loading = true;

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);

    userParamUrl = urlParams.get("user");
    tokenParamUrl = urlParams.get("token");

    if (!userParamUrl || !tokenParamUrl) {
      exec({ query: ME_QUERY })
        .then(({ data }) => {
          const user = data ? data.me : false;
          userStore.setUser(user);
          goto("/");
          loading = false;
        })
        .catch(error => {
          loading = false;
        });
    } else {
      exec({
        query: LOGIN_MUTATION,
        variables: { userId: userParamUrl, urlToken: tokenParamUrl }
      })
        .then(({ data }) => {
          const user = data ? data.login : false;
          userStore.setUser(user);
          goto("/");
          loading = false;
        })
        .catch(error => {
          loading = false;
        });
    }
  });
</script>

<style>

</style>

{#if loading}
  <div class="flex justify-center items-center h-screen w-screen">
    <Stretch size="6rem" background="#7999d2" />
  </div>
{:else}
  <Header />
  {#if $userStore}
    <!-- <Nav {segment} /> -->

    <main class="mt-8 p-8 container mx-auto">
      <slot />
    </main>
  {:else}
    <div
      class="flex justify-center items-center w-full h-48 text-2xl font-bold">
      Invalid url or session expired!
    </div>
  {/if}
{/if}
