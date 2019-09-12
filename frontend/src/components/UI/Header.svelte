<script>
  import feather from "feather-icons";

  import userStore from "../../stores/user-store";
  import { exec } from "../../graphql/client";
  import { LOGOUT_MUTATION } from "../../graphql/mutations";

  function handleLogout(e) {
    exec({
      query: LOGOUT_MUTATION
    })
      .then(({ data }) => {
        if (data && data.logout) {
          userStore.resetUser();
        }
      })
      .catch(err => {
        userStore.resetUser();
      });
  }
</script>

<header
  class="fixed w-full top-0 left-0 h-16 bg-primary-normal flex justify-center
  items-center shadow text-white">
  <i class="mr-4">
    {@html feather.icons.clock.toSvg()}
  </i>
  <h1 class="m-0 text-2xl tracking-widest font-bold">RemBot</h1>
</header>

{#if $userStore}
  <div
    class="text-white hover:text-primary-darker absolute top-0 right-0 mx-4 mt-5
    cursor-pointer"
    on:click={handleLogout}>
    <i>
      {@html feather.icons['log-out'].toSvg()}
    </i>
  </div>
{/if}
