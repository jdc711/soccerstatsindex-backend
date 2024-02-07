const PlayerStats = require('/opt/models/player-stats');

// Database Connection
const db = require('/opt/db/db')

exports.handler = async (event) => {
    try {
        await db();
        const isClub = event.queryStringParameters.isClub;
        const isClubBoolean = (isClub === 'true');
  
        let seasons;
        if (isClub === "All"){
            seasons = await PlayerStats.aggregate([
            {
                $group: {
                    _id: "$season" // Group by the season field
                }
            },
            {
                $sort: {
                    _id: -1 // Sort the grouped results in descending order
                }
            }
            ]);
        }
        else{
            seasons = await PlayerStats.aggregate([
            { 
            $lookup: {
                from: 'club', // the name of the collection in MongoDB
                localField: '_club_id', // field from the player-stats collection
                foreignField: '_id', // field from the clubs collection
                as: 'club_info' // array field added to player-stats documents
            }
            },
            { $unwind: '$club_info' }, // converts club_info from array (with one object) into object
            { 
            $addFields: {
                'is-club': '$club_info.is-club' // Add the is-club field from club_info to the document
            } 
            },
            { $match: { 'is-club': isClubBoolean } }, 
            {
                $group: {
                    _id: "$season" // Group by the season field
                }
            },
            {
                $sort: {
                    _id: -1 // Sort the grouped results in descending order
                }
            }
            ]);
        }
        return {
            statusCode: 200,
            body: JSON.stringify(seasons),
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
            body: JSON.stringify({ message: 'Server Error '+err }),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "https://www.soccerstatsindex.com", // Adjust as necessary
                "Access-Control-Allow-Credentials": true
            },
        };  
    }
};

