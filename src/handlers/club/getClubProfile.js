const Club = require('/opt/models/club');
const mongoose = require('/opt/node_modules/mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Database Connection
const db = require('/opt/db/db')

exports.handler = async (event) => {
    try {
        await db();
        let clubId = event.queryStringParameters.clubId; 
        clubId = new ObjectId(clubId);
    
      const clubProfile = await Club.aggregate([
        { $match: {_id: clubId} },
        { $lookup: { from: 'league', localField: '_league_ids', foreignField: '_id', as: 'league_info' } },
      ]);
      if (clubProfile.length > 0) {
        clubProfile[0].league_info.sort((a, b) => a.name.localeCompare(b.name));
      }
      return {
        statusCode: 200,
        body: JSON.stringify(clubProfile),
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