const cron = require("node-cron");
const { fetchTechNews } = require("./news"); // Import the function to fetch tech news
const { getChannelId } = require("./database"); // Import database function to get the channel ID

// Schedule daily news tasks for all servers
function scheduleDailyNews(client) {
    cron.schedule("0 9 * * *", async () => { // Runs every day at 9 AM
        // Go through all servers and send news to each configured channel
        client.guilds.cache.forEach(async (guild) => {
            const serverId = guild.id;
            getChannelId(serverId, async (channelId) => {
                if (channelId) {
                    const channel = client.channels.cache.get(channelId);
                    if (channel) {
                        const news = await fetchTechNews();
                        if (news.length === 0) {
                            channel.send("Sorry, I couldn't fetch the news right now. Please try again later.");
                        } else {
                            news.forEach((article) => {
                                channel.send(`**${article.title}**\n${article.url}`);
                            });
                        }
                    }
                }
            });
        });
    });
}

module.exports = { scheduleDailyNews };
