const axios = require("axios");

const API_KEY = process.env.NEWS_API_KEY; 
const NEWS_API_URL = `https://newsapi.org/v2/top-headlines?category=technology&apiKey=${API_KEY}`;

// Function to fetch tech news
async function fetchTechNews() {
    try {
        const response = await axios.get(NEWS_API_URL);
        return response.data.articles.slice(0, 5); 
    } catch (error) {
        console.error("Error fetching tech news:", error.message);
        return [];
    }
}

module.exports = { fetchTechNews };
