# Miru - Anime & Manga Discord Bot

> 🚧 **Currently in active development**

Miru is a Discord bot that brings anime, manga, and character information directly to your Discord server or DMs. Powered by the [Jikan API](https://jikan.moe/) (unofficial MyAnimeList API), Miru provides rich, detailed information with an intuitive dropdown interface.

## Features

- 🎬 **Anime Search** - Search and browse anime with detailed information
  - Studios with clickable links
  - Genres, air dates, rankings
  - 600-character synopses
  - English/Japanese titles
  - Interactive dropdown to browse up to 25 results

- 📚 **Manga Search** - Comprehensive manga information
  - Authors with clickable links
  - Genres, publication dates, rankings
  - Chapter and volume counts
  - Interactive result browsing

- 👤 **Character Search** - Detailed character profiles
  - Anime and manga appearances
  - Japanese voice actors
  - Favorites count
  - Browse multiple character results

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Discord bot token and application ID
   ```

3. **Register commands:**
   ```bash
   npm run deploy
   ```

4. **Start the bot:**
   ```bash
   npm start
   ```

## Commands

- `/anime <query>` - Search for anime by title
- `/manga <query>` - Search for manga by title
- `/character <query>` - Search for characters by name
- `/ping` - Check bot latency

## Installation Links

Replace `YOUR_CLIENT_ID` with your application ID.

- **Guild install (server installation)**
  ```
  https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands&permissions=0&integration_type=0
  ```

- **User install (personal installation)**
  ```
  https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=applications.commands&integration_type=1
  ```

## Tech Stack

- [Discord.js](https://discord.js.org/) v14
- [Jikan API](https://docs.api.jikan.moe/) v4
- Node.js

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- MyAnimeList for the anime/manga data
- [Jikan](https://jikan.moe/) for the awesome API
