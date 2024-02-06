const PlayerStats = require('../models/player-stats');

exports.getAllSeasons = async (req, res) => {
  const isClub = req.query.isClub;
  const isClubBoolean = (isClub === 'true');
  
  try {
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
        
    res.json(seasons);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

