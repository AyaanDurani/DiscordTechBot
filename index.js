require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const token = process.env.DISCORD_TOKEN;
const { fetchTechNews } = require("./news");
const {
    saveUserPreferences,
    getUserPreferences,
    saveChannelId,
    saveCategoryPreference,
} = require("./database");
const { scheduleDailyNews } = require("./scheduler");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Schedule daily news updates
    scheduleDailyNews(client);
});

client.on("messageCreate", async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Command to set the news category
    if (message.content.startsWith("!set-category")) {
        const args = message.content.split(" ");
        const category = args[1];

        if (!category) {
            message.channel.send(
                "Please specify a category (e.g., technology, business, sports)."
            );
            return;
        }

        saveCategoryPreference(message.guild.id, category);
        message.channel.send(
            `News category is now set to "${category}" for this server.`
        );
    }

    // Command to set the channel for news updates
    else if (message.content.startsWith("!set-channel")) {
        const channel = message.mentions.channels.first();
        if (!channel) {
            message.channel.send(
                "Please mention a channel where I should send tech news."
            );
            return;
        }

        saveChannelId(message.guild.id, channel.id);
        message.channel.send(
            `Tech news will now be sent to ${channel.name} in this server.`
        );
    }

    // Command to set user-specific topics
    else if (message.content.startsWith("!set-topic")) {
        const topics = message.content.replace("!set-topic", "").trim();
        if (!topics) {
            message.channel.send("Please specify at least one topic.");
            return;
        }

        saveUserPreferences(message.author.id, topics);
        message.channel.send(`Your topic preference has been saved: ${topics}`);
    }

    // Command to get user-specific topics
    else if (message.content === "!get-topic") {
        getUserPreferences(message.author.id, (topics) => {
            if (topics) {
                message.channel.send(`Your topic preferences are: ${topics}`);
            } else {
                message.channel.send(
                    "You haven't set any topic preferences yet."
                );
            }
        });
    }

    // Command to fetch tech news
    else if (message.content === "!technews") {
        try {
            const news = await fetchTechNews();
            if (!news || news.length === 0) {
                message.channel.send(
                    "Sorry, I couldn't fetch the news right now. Please try again later."
                );
                return;
            }

            // Send each article as a separate message
            for (const article of news) {
                message.channel.send(`**${article.title}**\n${article.url}`);
            }
        } catch (error) {
            console.error("Error fetching tech news:", error.message);
            message.channel.send(
                "An error occurred while fetching tech news. Please try again later."
            );
        }
    }
});

client.login(token);