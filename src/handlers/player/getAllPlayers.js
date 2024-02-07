const PlayerStats = require('/opt/models/player-stats');
// Database Connection
const db = require('/opt/db/db')

exports.handler = async (event) => {
    try {
        await db();
        const players = await PlayerStats.find();
        return {
            statusCode: 200,
            body: JSON.stringify(players),
            headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "https://www.soccerstatsindex.com", // Adjust as necessary
            "Access-Control-Allow-Credentials": true
            },
        };
    } catch (err) {
        console.error(err); // Logging the error
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server Error' }),
            headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "https://www.soccerstatsindex.com", // Adjust as necessary
            "Access-Control-Allow-Credentials": true
            },
        };
    }
};