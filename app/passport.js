/*accelerate v1.0 (Alice)
This file is part of accelerate v1.0.

MIT License

Copyright (c) 2017 Hoo Wan Hong

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';
module.exports = (function(){
	
	let TABLE = 'USERS';
	
	let PRIMARYKEY = 'USERNAME';
	let PASSWORD = 'PASSWD';
	let SALT = 'PUBLICKEY';
	
	var crypto = require('crypto');
	var passport = require('passport');
	var authStrategy = require('passport-local').Strategy;
	
	var bodyParser = require('body-parser');
    var cookieParser = require('cookie-parser');
	var session = require('express-session');
	var sqlstore = require('express-mysql-session')(session);
	
	function Obfuscate(){};
	Obfuscate.prototype.encrypt = function(passwd, salt){
		return passwd;
	};
	Obfuscate.prototype.authenticated = function(req){
		return req.user;
	};
	Obfuscate.prototype.verify = function(username){
		return username==='null';
	};
	
	let setup = function(app, database, settings){
		
		let cipher = new Obfuscate();
		
		passport.serializeUser(function(user, done) {
			done(null, user.contents);
		});

		passport.deserializeUser(
			function(id, done) {
				let finder = {};
				finder[PRIMARYKEY]=database.asString(id);
				database.run({table:TABLE,find:finder},
					function(err, docs, field){
						if(err){ done(err); }
						else{
							done(null,{ 
								table:TABLE, 
								contents:docs[0][PRIMARYKEY],
								message:'OK' 
							});
						}
					}
				);
			}
		);
		
		passport.use(
			new authStrategy(
				function(username, password, done){ 
					if(cipher.verify(username)===true){
						done({table:TABLE,contents:'null',message:'Invalid name'},false);
					}
					else{
						let finder = {};
						finder[PRIMARYKEY] = database.asString(username);
						database.run({table:TABLE,find:finder},
							function(err, docs, field){
								if(err){done(err);}
								else if(docs.length!==1){ done(null,false); }
								else{
									if(cipher.encrypt(password,docs[0][SALT])===docs[0][PASSWORD]){
										done(null,{ 
											table:TABLE, 
											contents:docs[0][PRIMARYKEY],
											message:'OK' 
										}); 
									}
									else{ done(null,false); }
								}
							}
						);
					}
				}
			)
		);
		
		app.use(cookieParser());
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: true }));
		
		app.use(session({
			resave: true,
			saveUninitialized: true,
			checkExpirationInterval: 90000,
			cookie: {
				httpOnly: true,
				maxAge: 1000*60*15
			},
			store: new sqlstore(settings.options,database.pool),
			secret: settings.keyword
		}));
		
		app.use(passport.initialize());
		app.use(passport.session());
	}
	
    return {
		configure: setup,
		authenticator: passport, 
		obfuscator: Obfuscate
	};
})();
