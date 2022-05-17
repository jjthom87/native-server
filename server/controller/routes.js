var path = require('path');
var mail = require('./../config/mail.js');

module.exports = (app, passport, db) => {
	var requireAuth = passport.authenticate('local-jwt', {session: false});

	app.get('/api/signed-in', requireAuth, function(req,res){
		if(req.session.passport != undefined){
			res.json({message: 'signed in user', user: req.session.passport.user});
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

	app.get('/api/itinerary', requireAuth, function(req,res){
		var query = `SELECT * FROM itinerary WHERE user_id=${req.session.passport.user.id}`;
		db.query(query, (error,queryRes) => {
			if(error){
				res.json({success: false, error: error})
			} else {
				res.json({success: true, itineraries: queryRes})
			}
		});
	});

	app.get('/api/users', function(req,res){
		var query = `SELECT id,email FROM users`;
		db.query(query, (error,queryRes) => {
			if(error){
				res.json({success: false, error: error})
			} else {
				if(req.session.passport){
					queryRes = queryRes.filter((user) => user.id != req.session.passport.user.id)
				}
				res.json({success: true, users: queryRes})
			}
		});
	});

	app.get('/api/user/:user_id/itinerary', function(req,res){
		var query = `SELECT * FROM itinerary WHERE user_id=${req.params.user_id}`;
		db.query(query, (error,queryRes) => {
			if(error){
				res.json({success: false, error: error})
			} else {
				res.json({success: true, itineraries: queryRes})
			}
		});
	});

	app.post('/api/itinerary/shared', function(req,res){
		if(!req.body.approved){
			var subject = "Itinerary Approval";
			var html = `<html><body><div><p>Hello ${req.body.requester_email},</p><p>${req.session.passport.user.email} has sent you a request to add the ${req.body.itinerary_name} itinerary to your app.</p><br><a href="https://beaniebabiesinfo.com/redirect-to-app">Open In App</a></div></body></html>`;
			mail.send(req.body.requester_email, subject, html);
		}
		var query = `INSERT INTO shared_itineraries (owner_id, requester_id, itinerary_id, approved) VALUES ('${req.body.owner_id}','${req.body.requester_id}','${req.body.itinerary_id}', ${req.body.approved ? 1 : 0})`;
		db.query(query, (error,queryRes) => {
			if(error){
				res.json({success: false, error: error})
			} else {
				res.json({success: true, itineraries: queryRes})
			}
		});
	});

	app.put('/api/itinerary/shared', function(req,res){
		if(req.body.approved){
			var query = `UPDATE shared_itineraries SET approved=1 WHERE itinerary_id=${req.body.itinerary_id} AND requester_id=${req.body.requester_id}`;
			db.query(query, (error,queryRes) => {
				if(error){
					res.json({success: false, error: error})
				} else {
					res.json({success: true, itinerary_id: req.body.itinerary_id})
				}
			});
		} else {
			var query = `DELETE FROM shared_itineraries WHERE itinerary_id=${req.body.itinerary_id} AND requester_id=${req.body.requester_id}`;
			db.query(query, (error,queryRes) => {
				if(error){
					res.json({success: false, error: error})
				} else {
					res.json({success: true, itinerary_id: req.body.itinerary_id})
				}
			});
		}
	});

	app.get('/api/itinerary/shared', function(req,res){
		const approved = req.query.approved == "true" ? 1 : 0;
		var query = `SELECT itinerary_id,owner_id FROM shared_itineraries WHERE requester_id=${req.session.passport.user.id} AND approved=${approved}`;
		db.query(query, (error,queryRes) => {
			if(error){
				res.json({success: false, error: error})
			} else {
				if(queryRes.length > 0){
					let sharedItineraryIds = queryRes.map((res) => res.itinerary_id);
					sharedItineraryIds = [...new Set(sharedItineraryIds)]
					query = `SELECT * FROM itinerary WHERE id in (${sharedItineraryIds.join(",")})`;
					db.query(query, (error,itineraryQueryRes) => {
						if(error){
							res.json({success: false, error: error})
						} else {
							query = `SELECT id,email FROM users`;
							db.query(query, (error,userQueryRes) => {
								if(error){
									res.json({success: false, error: error})
								} else {
									itineraryQueryRes.forEach((itinerary) => {
										userQueryRes.forEach((user)=> {
											if(itinerary.user_id == user.id){
												itinerary.owner_email = user.email;
											}
										})
									})
									res.json({success: true, itineraries: itineraryQueryRes})
								}
							});
						}
					});
				} else {
					res.json({success: true, itineraries: []})
				}
			}
		});
	});

	app.post('/api/sign-up', function(req,res,next){
		passport.authenticate('local-signup', function(err, user, info){
			if (err) {
				return next(err);
			} else {
				if (!user) {
		    	return res.json({success : false, message : 'authentication failed', info: info});
		    }
		    req.login(user, function(err){
					if(err){
						return next(err);
					}
			    return res.status(200).json({success : true, message : 'authentication succeeded', user: user, info: info});
				});
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
