const League = require('/opt/models/league');

// Database Connection
const db = require('/opt/db/db')

exports.handler = async (event) => {
    try {
        await db();
        const isClubCompetition = event.queryStringParameters.isClubCompetition; 
  
        let sort = {};
        sort["name"] = 1;
        let leagues;
        if (isClubCompetition === "All"){
            leagues = await League.find({}).sort(sort);
        }
        else{
            leagues = await League.find({"is-club-competition": isClubCompetition}).sort(sort);
        }
        return {
            statusCode: 200,
            body: JSON.stringify(leagues),
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
            body: JSON.stringify({ message: 'Server Error:' + err }),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "https://www.soccerstatsindex.com", // Adjust as necessary
                "Access-Control-Allow-Credentials": true
            },
        };    }
  }
  