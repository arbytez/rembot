# RemBot

Telegram bot: [@r_e_m_bot](https://t.me/r_e_m_bot)

Widely inspired by the bot *@SkeddyBot*

User can set in '*human language*' a reminder, the bot will remind you the content.
Check with the command */examples* which phrases are recognized.

**Note**: it does not manage time zones. Default *Europe/Rome*.

- **[Backend](/backend)**: apollo graphql express server connected to a prisma mongo db backend that manage the users state for the telegram bot and the creation of the reminders with their subscriptions events.
- **[Bot](/bot)**: telegram bot. It handles users commands and manages the subscriptions of the reminders events (notify user when a reminder is completed).
- **[Frontend](/frontend)**: simple web page build with sapper/svelte to manage user reminders.