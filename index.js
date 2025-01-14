require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const token = process.env.DISCORD_TOKEN;
const { fetchTechNews } = require("./news");
const { saveUserPreferences, getUserPreferences, saveChannelId} = require("./database");
const { scheduleDailyNews } = require("./scheduler");
const {saveCategoryPreference} = require("./database");


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Allows the bot to work with server-related events
    GatewayIntentBits.GuildMessages, // Enables the bot to read and respond to messages
    GatewayIntentBits.MessageContent, // Allows the bot to read the content of messages (required for message events)
  ],
});

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);

    scheduleDailyNews(client);
});



client.on("messageCreate", async (message) => {
    if (message.content.startsWith("!set-category")) {
        const args = message.content.split(" ");
        const category = args[1];

        if (!category) {
            message.channel.send("Please specify a category (e.g., technology, business, sports).");
            return;
        }

        // Save the category preference for the server
        saveCategoryPreference(message.guild.id, category);
        message.channel.send(`News category is now set to "${category}" for this server.`);
    }
    if (message.content.startsWith("!set-channel")) {
        // Check if a channel is mentioned
        const channel = message.mentions.channels.first();
        if (!channel) {
            message.channel.send("Please mention a channel where I should send tech news.");
            return;
        }

        // Save the channel ID in the database
        saveChannelId(message.guild.id, channel.id);

        // Confirm the channel has been set
        message.channel.send(`Tech news will now be sent to ${channel.name} in this server.`);
    }
    if (message.content.startsWith("!set-topic")) {
        const topics = message.content.replace("!set-topic", "").trim();
        saveUserPreferences(message.author.id, topics);
        message.channel.send(`Your topic preference has been saved: ${topics}`);
    } else if (message.content === "!get-topic") {
        getUserPreferences(message.author.id, (topics) => {
            if (topics) {
                message.channel.send(`Your topic preferences are: ${topics}`);
            } else {
                message.channel.send("You haven't set any topic preferences yet.");
            }
        });
    } else if (message.content === "!technews") {
        const news = await fetchTechNews();
        if (news.length === 0) {
            message.channel.send("Sorry, I couldn't fetch the news right now. Please try again later.");
        } else {
            news.forEach((article) => {
                message.channel.send(`**${article.title}**\n${article.url}`);
            });
        }
    }
});




client.login(token);
