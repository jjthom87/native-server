var path = require('path');

module.exports = (app, passport, db) => {
	app.get('/api/sign-up', function(req,res){
		if(req.user){
			res.json({message: 'signed-in', user_id: req.user.id});
		}
	});

	app.get('/api/sign-in', function(req,res){
		if(req.user){
			res.json({message: 'signed-in', user_id: req.user.id});
		}
	});

	app.get('/api/user/places', function(req,res){
	  var query = `SELECT * FROM places WHERE user_id=1`;
	  db.query(query, (error,queryRes) => {
	    if(error){
	      res.json({error: error})
	    } else {
	      res.json({usersRecs: queryRes})
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

	app.get('/', function(req,res){
		res.sendFile(path.join(__dirname, '../../client/public/html/main_page.html'));
	});

	app.get('/sign-up', function(req,res){
		res.sendFile(path.join(__dirname, '../../client/public/html/sign_up.html'));
	});

	app.get('/sign-in', function(req,res){
		res.sendFile(path.join(__dirname, '../../client/public/html/sign_in.html'));
	});

	app.get('/api/signed-in', (req,res) => {
		if(req.user){
			res.json({message: 'signed-in', user_id: req.user.id});
		}
	})


	app.get('/profile/:id', (req,res) => {
		if(req.user){
			if(req.user.id == req.params.id){
				var query = `SELECT name FROM users WHERE id=${req.params.id}`;
				db.query(query, (error,queryRes) => {
					if(error){
						res.json({error: error})
					} else {
            res.set('Content-Type', 'text/html');
						var str = "<html>";
						str += "<head><title>" + queryRes[0].name + "'s Page</title>"
						str += "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'>";
						str += '<link rel="stylesheet" type="text/css" href="../../../public/css/user_home.css"></head>'
						str += '<body><div class="container"><h1>Signed in User is '+queryRes[0].name+'</h1><br>';
						str += '<div class="btn-group" role="group" aria-label="Basic example">'
						str += '<a id="home-button" href="/" type="button" class="btn btn-primary sign-buttons">';
						str += '<span class="glyphicon glyphicon-home" aria-hidden="true"></span>';
						str += '</a>';
						str += '<a id="logout-button" type="button" class="btn btn-danger sign-buttons">Logout</a>'
						str += '</div></div>';
						str += '</body>'
						str += "<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'></script>";
						str += '<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>'
						str += "<script src='../../../public/js/user_home.js'></script>";
						str += "</body></html>";
            res.send(str);
					}
				});
			} else {
				res.redirect('/');
			}
		} else {
			res.redirect('/')
		}
	});

	app.delete('/api/logout-user', function (req, res) {
	  req.session.destroy(function(out){
	    res.json({loggedOut: true})
	  });
	});

}
