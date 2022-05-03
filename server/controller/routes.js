var path = require('path');

module.exports = (app, passport, db) => {
	var requireAuth = passport.authenticate('local-jwt', {session: false});

	app.get('/api/signed-in', requireAuth, function(req,res){
		if(req.session.passport.user){
			res.json({message: 'signed in user', user: req.session.passport.user});
		} else {
			res.json({message: 'no signed in user'})
		}
	});

	app.get('/api/user/places', requireAuth, function(req,res){
	  var query = `SELECT * FROM places WHERE user_id=1`;
	  db.query(query, (error,queryRes) => {
	    if(error){
	      res.json({error: error})
	    } else {
	      res.json({usersRecs: queryRes})
	    }
	  });
	});

	app.post('/api/itinerary', requireAuth, function(req,res){
		var query = `INSERT INTO itinerary (name, details, user_id) VALUES ('${req.body.itineraryName}','${JSON.stringify(req.body.details)}','${req.session.passport.user.id}')`;
	  db.query(query, (error,queryRes) => {
	    if(error){
	      res.json({success: false, error: error})
	    } else {
	      res.json({success: true})
	    }
	  });
	});

	app.post('/api/sign-up', function(req,res,next){
		passport.authenticate('local-signup', function(err, user, info){
			if (err) {
				return next(err);
			} else {
				res.json({user: user, info: info})
			}
		})(req, res, next);
	});



	app.post('/api/sign-in', function(req,res,next){
		passport.authenticate('local-signin', function(err, user, info){
		    if (err) {
		      	return next(err);
		    }
		    if (!user) {
		    	return res.json({success : false, message : 'authentication failed', info: info});
		    }
		    req.login(user, function(err){
				if(err){
					return next(err);
				}
		    return res.status(200).json({success : true, message : 'authentication succeeded', user: user, info: info});
			});
	  	})(req, res, next);
	});

	app.delete('/api/logout', function (req, res) {
	  req.session.destroy(function(out){
	    res.json({loggedOut: true})
	  });
	});

}
