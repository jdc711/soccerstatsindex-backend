const PlayerStats = require('/opt/models/player-stats');
const mongoose = require('/opt/node_modules/mongoose');
const ObjectId = mongoose.Types.ObjectId;

const db = require('/opt/db/db')

exports.handler = async (event) => {    

    await db();       
    let leagueIds = event.multiValueQueryStringParameters["leagueIds[]"];
    const season = event.queryStringParameters.season;
    const isClub = event.queryStringParameters.isClub;
    let clubIds = event.multiValueQueryStringParameters["clubIds[]"]; 
    const category = event.queryStringParameters.category;
    let currentPage = parseInt(event.queryStringParameters.currentPage) || 1;
    const pageLimit = parseInt(event.queryStringParameters.pageLimit) || 10; 
    let skip = (currentPage - 1) * pageLimit;
    
    if (!leagueIds){
      leagueIds = [];
    }
    else{
      leagueIds = leagueIds.map(id => typeof id === 'string' ? new ObjectId(id) : id);
    }
    if (!clubIds){
      clubIds = [];
    }
    else{
      clubIds = clubIds.map(id => typeof id === 'string' ? new ObjectId(id) : id);
    }
    
    let sortCondition;
    if (category === "goals"){
      sortCondition = { "goals": -1 };
    }
    else if (category === "assists"){
      sortCondition = { "assists": -1 };
    }
    else if (category === "man-of-the-matches"){
      sortCondition = { "man-of-the-matches": -1 };
    }
    else {
      sortCondition = { "average-match-rating": -1 };
    }
    let matchCondition;
    if (leagueIds.length === 0 && clubIds.length === 0 && season === "All" ){
      matchCondition = {};
    }
    else if (leagueIds.length === 0 && clubIds.length === 0){
      let seasons = season.split("/");
      seasons.push(season);
      matchCondition = { 
        "season": { "$in": seasons },
      };
    }
    else if (leagueIds.length === 0 && season === "All"){
      matchCondition = { 
        "_club_id": { "$in": clubIds },      
      };
    }
    else if (clubIds.length === 0 && season === "All"){
      matchCondition = { 
        "_league_id": { "$in": leagueIds },
      };
    }
    else if (leagueIds.length === 0){
      let seasons = season.split("/");
      seasons.push(season);
      matchCondition = { 
        "_club_id": { "$in": clubIds },     
        "season": { "$in": seasons },
      };
    }
    else if (clubIds.length === 0){
      let seasons = season.split("/");
      seasons.push(season);
      matchCondition = { 
        "_league_id": { "$in": leagueIds },     
        "season": { "$in": seasons },
      };
    }
    else if (season === "All"){
      matchCondition = { 
        "_league_id": { "$in": leagueIds },  
        "_club_id": { "$in": clubIds },     
      };
    }
    else {
      let seasons = season.split("/");
      seasons.push(season);
      matchCondition = { 
        "_league_id": { "$in": leagueIds },     
        "season": { "$in": seasons },
        "_club_id": { "$in": clubIds },      
      };
    }
    
    let isClubMatchCondition;
    if (isClub === "All"){
      isClubMatchCondition = {};
    }
    else{
      let isClubBoolean = isClub === "true";
      isClubMatchCondition = { 'is-club': isClubBoolean };
    }
  
    try {
      let totalCount = await PlayerStats.aggregate([
        { $match: matchCondition },
        { $lookup: { from: 'club', localField: '_club_id', foreignField: '_id', as: 'club_info' } },
        { $unwind: '$club_info' },
        { $addFields: { 'is-club': '$club_info.is-club'} },
        { $match: isClubMatchCondition }, 
        { $lookup: { from: 'league', localField: '_league_id', foreignField: '_id', as: 'league_info' } },
        { $lookup: { from: 'player', localField: '_player_id', foreignField: '_id', as: 'player_info' } },
        { $sort: sortCondition },
        { $count: "totalCount" }
      ]);
      
      if (totalCount.length === 0){
        totalCount = 0;
      }
      else{
        totalCount = totalCount[0]["totalCount"];
      }
      
      // Ensure totalCount does not exceed 100
      totalCount = Math.min(totalCount, 100);
  
      // Calculate totalPages based on the new totalCount
      let totalPages = Math.ceil(totalCount / pageLimit);
  
      // Adjust currentPage if necessary
      if (currentPage > totalPages) {
        // max function used in the case totalPages = 0
        currentPage = Math.max(1,totalPages);
      }
  
      // Calculate skip based on the adjusted currentPage
      skip = (currentPage - 1) * pageLimit;
      
      let topGoalScorersStats = await PlayerStats.aggregate([
        { $match: matchCondition },
        { $lookup: { from: 'club', localField: '_club_id', foreignField: '_id', as: 'club_info' } },
        { $unwind: '$club_info' },
        { $addFields: { 'is-club': '$club_info.is-club' } },
        { $match: isClubMatchCondition }, 
            { $lookup: { from: 'league', localField: '_league_id', foreignField: '_id', as: 'league_info' } },
            { $lookup: { from: 'player', localField: '_player_id', foreignField: '_id', as: 'player_info' } },
        { $sort: sortCondition },
      ]).skip(skip).limit(pageLimit);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
            topGoalScorersStats: topGoalScorersStats,
            totalCount: totalCount,
            totalPages: Math.ceil(totalCount / pageLimit),
            currentPage: currentPage,
        }),
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
  