const { Client, GatewayIntentBits } = require("discord.js");
const { saveUserPreferences, getUserPreferences, saveChannelId } = require("./database");
const { scheduleDailyNews } = require("./scheduler");
const { saveCategoryPreference } = require("./database");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  scheduleDailyNews(client);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore bot messages to prevent loops

  if (message.content.startsWith("!set-channel")) {
    const channel = message.mentions.channels.first();
    if (!channel) {
      message.channel.send("Please mention a channel where I should send tech news.");
      return;
    }

    saveChannelId(message.guild.id, channel.id);
    message.channel.send(`Tech news will now be sent to ${channel.name} in this server.`);
  }

  if (message.content.startsWith("!set-category")) {
    const args = message.content.split(" ");
    const category = args[1];
    if (!category) {
      message.channel.send("Please specify a category (e.g., technology, business, sports).");
      return;
    }

    saveCategoryPreference(message.guild.id, category);
    message.channel.send(`News category is now set to "${category}" for this server.`);
  }

  if (message.content.startsWith("!set-topic")) {
    const topics = message.content.replace("!set-topic", "").trim();
    saveUserPreferences(message.author.id, topics);
    message.channel.send(`Your topic preference has been saved: ${topics}`);
  }

  if (message.content === "!get-topic") {
    getUserPreferences(message.author.id, (topics) => {
      if (topics) {
        message.channel.send(`Your topic preferences are: ${topics}`);
      } else {
        message.channel.send("You haven't set any topic preferences yet.");
      }
    });
  }
});

client.login(process.env.DISCORD_TOKEN);