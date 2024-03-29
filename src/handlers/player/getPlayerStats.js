const PlayerStats = require('/opt/models/player-stats');
const mongoose = require('/opt/node_modules/mongoose');
const ObjectId = mongoose.Types.ObjectId;
const db = require('/opt/db/db')

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        await db();

        let playerId = event.queryStringParameters.playerId;
        let clubId = event.queryStringParameters.clubId;
        
        playerId = new ObjectId(playerId);
        if (clubId){
            clubId = new ObjectId(clubId);
        }
        
        let sortColumn = event.queryStringParameters.sortColumn;
        let sortDirection = event.queryStringParameters.sortDirection;
   
        let playerStats;
        if (!clubId){
            if (sortDirection === ""){
                let sort = {};
                sort["season"] = -1;
                playerStats = await PlayerStats.aggregate([
                    { $match: {_player_id: playerId} },
                    { $sort: sort }, 
                    { $lookup: { from: 'club', localField: '_club_id', foreignField: '_id', as: 'club_info' } },
                    { $lookup: { from: 'league', localField: '_league_id', foreignField: '_id', as: 'league_info' } },
                    { $lookup: { from: 'player', localField: '_player_id', foreignField: '_id', as: 'player_info' } },
                ]);
            }
            else{
                let sort = {};
                sort[sortColumn] = sortDirection === 'DESC' ? -1 : 1;
                playerStats = await PlayerStats.aggregate([
                    { $match: {_player_id: playerId} },
                    { $sort: sort }, 
                    { $lookup: { from: 'club', localField: '_club_id', foreignField: '_id', as: 'club_info' } },
                    { $lookup: { from: 'league', localField: '_league_id', foreignField: '_id', as: 'league_info' } },
                    { $lookup: { from: 'player', localField: '_player_id', foreignField: '_id', as: 'player_info' } },
                ]);
                }  
            }
        else{
            if (sortDirection === ""){
                let sort = {};
                sort["season"] = -1;
                playerStats = await PlayerStats.aggregate([
                    { $match: {_player_id: playerId, _club_id: clubId} },
                    { $sort: sort }, 
                    { $lookup: { from: 'club', localField: '_club_id', foreignField: '_id', as: 'club_info' } },
                    { $lookup: { from: 'league', localField: '_league_id', foreignField: '_id', as: 'league_info' } },
                    { $lookup: { from: 'player', localField: '_player_id', foreignField: '_id', as: 'player_info' } },
                ]);
            }
            else{
                let sort = {};
                sort[sortColumn] = sortDirection === 'DESC' ? -1 : 1;
                playerStats = await PlayerStats.aggregate([
                    { $match: {_player_id: playerId, _club_id: clubId} },
                    { $sort: sort },
                    { $lookup: { from: 'club', localField: '_club_id', foreignField: '_id', as: 'club_info' } },
                    { $lookup: { from: 'league', localField: '_league_id', foreignField: '_id', as: 'league_info' } },
                    { $lookup: { from: 'player', localField: '_player_id', foreignField: '_id', as: 'player_info' } },
                ]);
            }  
        }
        return {
            statusCode: 200,
            body: JSON.stringify(playerStats),
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
            body: JSON.stringify({ message: err }),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "https://www.soccerstatsindex.com", // Adjust as necessary
                "Access-Control-Allow-Credentials": true
            },
        };    }
};