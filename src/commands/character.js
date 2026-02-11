const { EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require("discord.js");
const {
  ApplicationIntegrationType,
  InteractionContextType
} = require("discord-api-types/v10");
const { searchCharacter, getCharacterAnime, getCharacterManga, getCharacterVoiceActors, truncate } = require("../lib/jikan");

function listTitles(items) {
  if (!Array.isArray(items) || items.length === 0) return "None";
  const titles = items
    .map((item) => item?.anime?.title || item?.manga?.title)
    .filter(Boolean)
    .slice(0, 5)
    .map(title => `\`${title}\``);

  return titles.length ? titles.join("\n") : "None";
}

function listVoiceActors(voiceActors) {
  if (!Array.isArray(voiceActors) || voiceActors.length === 0) return "None";
  
  // Voice actors data structure from Jikan API
  const actors = voiceActors
    .filter((va) => va.language === "Japanese")
    .map((va) => va.person?.name)
    .filter(Boolean)
    .slice(0, 3);

  return actors.length ? actors.join("\n") : "None";
}

function createCharacterEmbed(result, currentIndex, totalResults) {
  return new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle(result.name || "Unknown")
    .setURL(result.url || null)
    .setDescription(truncate(result.about, 600) || "No description available.")
    .setThumbnail(result.images?.jpg?.image_url || null)
    .addFields(
      {
        name: "Anime",
        value: listTitles(result.animeInfo || []),
        inline: true
      },
      {
        name: "Manga",
        value: listTitles(result.mangaInfo || []),
        inline: true
      },
      {
        name: "Voice Actors (JP)",
        value: listVoiceActors(result.voiceActors || []),
        inline: false
      },
      {
        name: "Favorites",
        value: result.favorites ? String(result.favorites) : "0",
        inline: true
      }
    )
    .setFooter({ 
      text: `Found ${totalResults} result(s) • Showing result ${currentIndex + 1}/${totalResults} • Source: Jikan API` 
    });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("character")
    .setDescription("Search for an anime character")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Character name to search for")
        .setRequired(true)
    )
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall
    ])
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.BotDM,
      InteractionContextType.PrivateChannel
    ])
    .setDMPermission(true),
  async execute(interaction) {
    const query = interaction.options.getString("query", true);

    await interaction.deferReply();

    const results = await searchCharacter(query);
    if (!results || results.length === 0) {
      await interaction.editReply("No character results found.");
      return;
    }

    // Fetch anime and manga for the first result
    const firstCharacter = results[0];
    const [animeData, mangaData, voiceActorData] = await Promise.all([
      getCharacterAnime(firstCharacter.mal_id),
      getCharacterManga(firstCharacter.mal_id),
      getCharacterVoiceActors(firstCharacter.mal_id)
    ]);
    firstCharacter.animeInfo = animeData;
    firstCharacter.mangaInfo = mangaData;
    firstCharacter.voiceActors = voiceActorData;

    // Create dropdown menu with results
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("character_select")
      .setPlaceholder("Select a character to view details")
      .addOptions(
        results.slice(0, 25).map((result, index) => ({
          label: truncate(result.name || "Unknown", 100),
          description: truncate(result.nicknames?.[0] || "Character", 100),
          value: String(index)
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = createCharacterEmbed(results[0], 0, results.length);
    const response = await interaction.editReply({
      embeds: [embed],
      components: [row]
    });

    // Create collector for dropdown interactions
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 300_000 // 5 minutes
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({
          content: "This dropdown is not for you!",
          ephemeral: true
        });
        return;
      }

      const selectedIndex = parseInt(i.values[0]);
      const selectedResult = results[selectedIndex];
      
      // Fetch anime and manga data if not already cached
      if (!selectedResult.animeInfo || !selectedResult.mangaInfo || !selectedResult.voiceActors) {
        const [animeData, mangaData, voiceActorData] = await Promise.all([
          getCharacterAnime(selectedResult.mal_id),
          getCharacterManga(selectedResult.mal_id),
          getCharacterVoiceActors(selectedResult.mal_id)
        ]);
        selectedResult.animeInfo = animeData;
        selectedResult.mangaInfo = mangaData;
        selectedResult.voiceActors = voiceActorData;
      }
      
      const selectedEmbed = createCharacterEmbed(selectedResult, selectedIndex, results.length);

      await i.update({
        embeds: [selectedEmbed],
        components: [row]
      });
    });

    collector.on("end", async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch (error) {
        // Message might have been deleted
      }
    });
  }
};
