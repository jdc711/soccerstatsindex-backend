const Player = require('../models/player');
const PlayerStats = require('../models/player-stats');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.getPlayerProfile = async (req, res) => {
  let playerId = req.query.playerId; 
  playerId = new ObjectId(playerId);
  try {
    let playerProfile = await Player.aggregate([
      { $match: {_id: playerId} },
      { $lookup: { from: 'club', localField: '_club_ids', foreignField: '_id', as: 'club_info' } },
      { $lookup: { from: 'club', localField: '_current_club_id', foreignField: '_id', as: 'current_club_info' } },
    ]);
    // Sort the club_info array in the application code
    if (playerProfile.length > 0) {
      playerProfile[0].club_info.sort((a, b) => a.name.localeCompare(b.name));
    }
    res.json(playerProfile);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getPlayerStats = async (req, res) => {
  let playerId = req.query.playerId; 
  let clubId = req.query.clubId; 

  playerId = new ObjectId(playerId)
  if (clubId){
    clubId = new ObjectId(clubId);
  }

  const sortColumn = req.query.sortColumn;
  const sortDirection = req.query.sortDirection;
  try {
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
    res.json(playerStats);  
  } 
  catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getAllPlayers = async (req, res) => {
    try {
      const players = await PlayerStats.find();
      res.json(players);
    } catch (err) {
      res.status(500).send('Server Error');
    }
};

exports.searchByPlayerName = async (req, res) => {
  const nameToSearch = req.query.name; 
  const currentPage = parseInt(req.query.currentPage) || 1;
  const pageLimit = parseInt(req.query.pageLimit) || 10; 
  const skip = (currentPage - 1) * pageLimit;
  const sortColumn = req.query.sortColumn;
  const sortDirection = req.query.sortDirection;

  try {
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
    res.json({
      totalPlayerCount: totalPlayerCount,
      totalPages: Math.ceil(totalPlayerCount / pageLimit),
      currentPage: currentPage,
      players: players
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getTopPerformersStats = async (req, res) => {
  let leagueIds = req.query.leagueIds;
  const season = req.query.season;
  const isClub = req.query.isClub;
  let clubIds = req.query.clubIds; 
  const category = req.query.category;
  let currentPage = parseInt(req.query.currentPage) || 1;
  const pageLimit = parseInt(req.query.pageLimit) || 10; 
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
      
    res.json({
      topGoalScorersStats: topGoalScorersStats,
      totalCount: totalCount,
      totalPages: Math.ceil(totalCount / pageLimit),
      currentPage: currentPage,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
