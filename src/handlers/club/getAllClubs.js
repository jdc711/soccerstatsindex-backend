const Club = require('/opt/models/club');
const mongoose = require('/opt/node_modules/mongoose');
const ObjectId = mongoose.Types.ObjectId;
// Database Connection
const db = require('/opt/db/db')

exports.handler = async (event) => {
    try {
        await db();
        let leagueIds = event.multiValueQueryStringParameters["leagueIds[]"]; 
        if (!leagueIds){
            leagueIds = [];
        }
        else {
            leagueIds = leagueIds.map(id => new ObjectId(id));
        }
        const isClub = event.queryStringParameters.isClub;
    
        let matchCondition;
        if (leagueIds.length === 0 && isClub === "All"){
  
            matchCondition = {};
        }
        else if (leagueIds.length === 0){
            matchCondition = { "is-club": isClub };
        }
        else if (isClub === "All"){
            matchCondition = {
                "_league_ids": {"$in": leagueIds}
            };
        }
        else{
      
            matchCondition = {
                "is-club": isClub,
                "_league_ids": {"$in": leagueIds}
            };
        }
  
        const clubs = await Club.aggregate([
            { $match: matchCondition },
            { $lookup: { from: 'league', localField: '_league_ids', foreignField: '_id', as: 'league_info' } },
        ]);
        return {
            statusCode: 200,
            body: JSON.stringify(clubs),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    } catch (err) {
        console.error(err); // Logging the error
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Server Error' }),
            headers: {
                'Content-Type': 'application/json',
            },
        };    
    }
  };
  
  