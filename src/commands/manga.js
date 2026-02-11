const { EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require("discord.js");
const {
  ApplicationIntegrationType,
  InteractionContextType
} = require("discord-api-types/v10");
const { searchManga, truncate } = require("../lib/jikan");

function createMangaEmbed(result, currentIndex, totalResults) {
  const title = result.title_english && result.title_english !== result.title
    ? `${result.title_english} (${result.title})`
    : result.title || "Unknown";

  const authors = result.authors || [];
  const authorText = authors.length > 0 
    ? authors.map(a => a.name).join("; ")
    : "Unknown";
  const authorUrl = authors.length > 0 ? authors[0].url : null;

  const genres = result.genres || [];
  const genreText = genres.length > 0
    ? genres.map(g => g.name).join(", ")
    : "None";

  const published = result.published || {};
  let publishedText = "Unknown";
  if (published.from) {
    const startTimestamp = Math.floor(new Date(published.from).getTime() / 1000);
    if (published.to) {
      const endTimestamp = Math.floor(new Date(published.to).getTime() / 1000);
      publishedText = `<t:${startTimestamp}:d> - <t:${endTimestamp}:d>`;
    } else {
      publishedText = `<t:${startTimestamp}:d> - Ongoing`;
    }
  }

  const embed = new EmbedBuilder()
    .setColor(0xe67e22)
    .setTitle(truncate(title, 256))
    .setURL(result.url || null)
    .setDescription(truncate(result.synopsis, 600) || "No synopsis available.")
    .setThumbnail(result.images?.jpg?.image_url || null);

  if (authorUrl) {
    embed.setAuthor({ name: authorText, url: authorUrl });
  } else {
    embed.setAuthor({ name: authorText });
  }

  embed.addFields(
    {
      name: "Type",
      value: result.type || "Unknown",
      inline: true
    },
    {
      name: "Chapters",
      value: result.chapters ? String(result.chapters) : "Unknown",
      inline: true
    },
    {
      name: "Volumes",
      value: result.volumes ? String(result.volumes) : "Unknown",
      inline: true
    },
    {
      name: "Score",
      value: result.score ? String(result.score) : "N/A",
      inline: true
    },
    {
      name: "Status",
      value: result.status || "Unknown",
      inline: true
    },
    {
      name: "Rank",
      value: result.rank ? `#${result.rank}` : "N/A",
      inline: true
    },
    {
      name: "Published",
      value: publishedText,
      inline: false
    },
    {
      name: "Genres",
      value: genreText,
      inline: false
    }
  );

  const footerText = `Found ${totalResults} result(s) • Showing result ${currentIndex + 1}/${totalResults} • Source: Jikan API`;
  embed.setFooter({ text: footerText });

  return embed;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("manga")
    .setDescription("Search for a manga title")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Manga title to search for")
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

    const results = await searchManga(query);
    if (!results || results.length === 0) {
      await interaction.editReply("No manga results found.");
      return;
    }

    // Create dropdown menu with results
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("manga_select")
      .setPlaceholder("Select a manga to view details")
      .addOptions(
        results.slice(0, 25).map((result, index) => ({
          label: truncate(result.title || "Unknown", 100),
          description: truncate(result.type || "Unknown", 100),
          value: String(index)
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = createMangaEmbed(results[0], 0, results.length);
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
      const selectedEmbed = createMangaEmbed(selectedResult, selectedIndex, results.length);

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

