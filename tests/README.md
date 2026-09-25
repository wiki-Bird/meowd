Run `nvm use`, then `yarn test`.

Tests cover polls, help buttons, image output, purge checks, dice rolls, duration parsing, command dispatch, and the ready handler. Names follow `GIVEN … WHEN … THEN …`, with GIVEN omitted when unnecessary.

Discord builders and Canvas run locally. Replies and network calls are replaced, and the bot entry point is never started. No Firebase connection or credentials are needed.

Assertions check outputs so they can remain in place during the Discord.js upgrade. Live requests, Firebase commands/events, and asynchronous command-error handling are not covered.

Additional tests check representative command definitions (including permissions, choices and subcommands), PNG avatar URLs for imgedit/whois, the declared ready event against Discord’s event name, and time conversion. The event test registers the handler locally; it does not run the entry point. Config coverage only serializes its definition and never executes it.

Three TODO tests document existing conversion bugs: 12am/12pm are swapped, and invalid destination timezones are not rejected. These assertions run but do not fail the suite until the TODO markers are removed.
