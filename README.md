# Discord.js Starter (User + Guild Installable)

This is a minimal Discord.js v14 template that supports both **user install** and **guild install** command contexts.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy env file and fill values:

   ```bash
   cp .env.example .env
   ```

3. Register commands:

   ```bash
   npm run deploy
   ```

4. Start the bot:

   ```bash
   npm start
   ```

## OAuth2 Install Links

Replace `YOUR_CLIENT_ID` with your application ID.

- **Guild install (bot + slash commands)**
  ```
  https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands&permissions=0&integration_type=0
  ```

- **User install (slash commands for users)**
  ```
  https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=applications.commands&integration_type=1
  ```

## Notes

- Commands are defined in [src/commands](src/commands).
- The `ping` command is configured for both user and guild contexts.
- If `GUILD_ID` is set, commands are registered to that guild only (fast). Otherwise they are global.
