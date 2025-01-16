const cron = require("node-cron");
const { fetchTechNews } = require("./news"); // Import the function to fetch tech news
const { getChannelId } = require("./database"); // Import database function to get the channel ID

// Schedule daily news tasks for all servers
function scheduleDailyNews(client) {
    cron.schedule("*/1 * * * *", () => { 
        (async () => {
            client.guilds.cache.forEach(async (guild) => {
                const serverId = guild.id;
                getChannelId(serverId, async (channelId) => {
                    if (channelId) {
                        const channel = client.channels.cache.get(channelId);
                        if (channel) {
                            try {
                                const news = await fetchTechNews();
                                if (news.length === 0) {
                                    channel.send("No news available at the moment.");
                                } else {
                                    news.forEach((article) => {
                                        channel.send(`**${article.title}**\n${article.url}`);
                                    });
                                }
                            } catch (error) {
                                console.error(`Failed to fetch or send news: ${error.message}`);
                            }
                        } else {
                            console.log(`Invalid channel ID: ${channelId} in server: ${serverId}`);
                        }
                    } else {
                        console.log(`No channel configured for server: ${serverId}`);
                    }
                });
            });
        })();
    });
}

module.exports = { scheduleDailyNews };
