const Player = require('/opt/models/player');
const mongoose = require('/opt/node_modules/mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Database Connection
const db = require('/opt/db/db')

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        await db();
        let playerId = event.queryStringParameters.playerId;
    
        playerId = new ObjectId(playerId);
        let playerProfile = await Player.aggregate([
        { $match: {_id: playerId} },
        { $lookup: { from: 'club', localField: '_club_ids', foreignField: '_id', as: 'club_info' } },
        { $lookup: { from: 'club', localField: '_current_club_id', foreignField: '_id', as: 'current_club_info' } },
        ]);
        // Sort the club_info array in the application code
        if (playerProfile.length > 0) {
            playerProfile[0].club_info.sort((a, b) => a.name.localeCompare(b.name));
        }
    
        return {
            statusCode: 200,
            body: JSON.stringify(playerProfile),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "https://www.soccerstatsindex.com", // Adjust as necessary
                "Access-Control-Allow-Credentials": true
            },
        };
    } 
    catch (err) {
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