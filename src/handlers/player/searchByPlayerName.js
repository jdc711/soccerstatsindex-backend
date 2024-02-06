const Player = require('/opt/models/player');

// Database Connection
const db = require('/opt/db/db')

exports.handler = async (event) => {  
    try {
        await db();

        const nameToSearch = event.queryStringParameters && event.queryStringParameters.name; 
        
        const currentPage = parseInt(event.queryStringParameters.currentPage) || 1;
        const pageLimit = parseInt(event.queryStringParameters.pageLimit) || 10; 
        const skip = (currentPage - 1) * pageLimit;
        const sortColumn = event.queryStringParameters && event.queryStringParameters.sortColumn;
        const sortDirection = event.queryStringParameters && event.queryStringParameters.sortDirection;
  
      let players;
      let totalPlayerCount;
      let matchCondition =  { "searchable-names": { $regex: nameToSearch, $options: "i" } };
  
      if (sortDirection === ""){
        players = await Player.aggregate([
          { $match: matchCondition },
          { $lookup: { from: 'club', localField: '_club_ids', foreignField: '_id', as: 'club_info' } },
          { $lookup: { from: 'club', localField: '_current_club_id', foreignField: '_id', as: 'current_club_info' } },
        ]).skip(skip).limit(pageLimit);
        
        totalPlayerCount = await Player.countDocuments(matchCondition);
      }
      else{
        let sort = {};
        sort[sortColumn] = sortDirection === 'DESC' ? -1 : 1;
        players = await Player.aggregate([
          { $match: matchCondition },
          { $lookup: { from: 'club', localField: '_club_ids', foreignField: '_id', as: 'club_info' } },
          { $lookup: { from: 'club', localField: '_current_club_id', foreignField: '_id', as: 'current_club_info' } },
        ]).sort(sort).skip(skip).limit(pageLimit);
        
        totalPlayerCount = await Player.countDocuments(matchCondition);
      }
      return {
        statusCode: 200,
        body: JSON.stringify(
            {
                totalPlayerCount: totalPlayerCount,
                totalPages: Math.ceil(totalPlayerCount / pageLimit),
                currentPage: currentPage,
                players: players
            }
        ),
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