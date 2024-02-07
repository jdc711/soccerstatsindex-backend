const League = require('/opt/models/league');

// Database Connection
const db = require('/opt/db/db')

exports.handler = async (event) => {
    try {
        await db();   
        const leagueId = event.queryStringParameters.leagueId; 
  
        const leagueProfile = await League.find({_id: leagueId});
        return {
            statusCode: 200,
            body: JSON.stringify(leagueProfile),
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