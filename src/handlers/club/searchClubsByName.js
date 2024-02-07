const Club = require('/opt/models/club');

// Database Connection
const db = require('/opt/db/db')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

    try {
        await db();
        const nameToSearch = event.queryStringParameters.name; 
        const currentPage = parseInt(event.queryStringParameters.currentPage) || 1;
        const pageLimit = parseInt(event.queryStringParameters.pageLimit) || 10; 
        const skip = (currentPage - 1) * pageLimit;
        const sortColumn = event.queryStringParameters.sortColumn;
        const sortDirection = event.queryStringParameters.sortDirection;
    
      let clubs;
      let totalClubCount;
      let matchCondition = { name: {$regex : nameToSearch,  $options: "i"}, "is-club":true };
      if (sortDirection === ""){
        clubs = await Club.aggregate([
          { $match: matchCondition },
          { $lookup: { from: 'league', localField: '_league_ids', foreignField: '_id', as: 'league_info' } }, 
        ]).skip(skip).limit(pageLimit);
        
        totalClubCount = await Club.countDocuments(matchCondition);
      }
      else{
        let sort = {};
        sort[sortColumn] = sortDirection === 'DESC' ? -1 : 1;
  
        clubs = await Club.aggregate([
          { $match: matchCondition },
          { $lookup: { from: 'league', localField: '_league_ids', foreignField: '_id', as: 'league_info' } },
        ]).sort(sort).skip(skip).limit(pageLimit);
        
        totalClubCount = await Club.countDocuments(matchCondition);
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify(
            {
                totalClubCount: totalClubCount,
                totalPages: Math.ceil(totalClubCount / pageLimit),
                currentPage: currentPage,
                clubs: clubs,
            }
        ),
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
            body: JSON.stringify({ message: err }),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "https://www.soccerstatsindex.com", // Adjust as necessary
                "Access-Control-Allow-Credentials": true
            },
        };
    }
};
  