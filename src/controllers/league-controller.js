const League = require('../models/league');

exports.getLeagueProfile = async (req, res) => {
  const leagueId = req.query.leagueId; 

  try {
    const leagueProfile = await League.find({_id: leagueId});
    res.json(leagueProfile);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getAllLeagues = async (req, res) => {
  const isClubCompetition = req.query.isClubCompetition; 

  try {
    let sort = {};
    sort["name"] = 1;
    let leagues;
    if (isClubCompetition === "All"){
      leagues = await League.find({}).sort(sort);
    }
    else{
      leagues = await League.find({"is-club-competition": isClubCompetition}).sort(sort);
    }
    res.json(leagues);
  } catch (err) {
    res.status(500).send('Server Error');
  }
}
