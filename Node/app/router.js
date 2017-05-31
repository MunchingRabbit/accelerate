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
	
	var file = require('fs');
	var path = require('path');
	var multer = require('multer');
	
	let setup = function(app, express, db, passport, settings){
		
		let encoder = new passport.obfuscator();
		let handler = multer({ dest: settings.client.storage });
		let domain = (settings.client.baseurl).concat(settings.client.fileurl);
		
		app.use(function(req, res, next) {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
			next();
		});
		app.use(function (err, req, res, next) {
			console.log(err.stack); next();
		});

		file.readdirSync(settings.models).forEach(
			function(filename){
				let data = require(path.join(settings.models, filename)); 
				if(data.scaffold){ 
					let model = new data.model();
					let controller = data.scaffold.arbiter===true?
						new data.controller(db, model, encoder, passport.authenticator)
						:new data.controller(db, model, encoder);
					let router = express.Router();
					router.get(model.geturl, controller.get); router.put(model.puturl, controller.put);
					router.post(model.posturl, controller.post); router.delete(model.deleteurl, controller.delete); 
					app.use((settings.client.baseurl).concat(model.baseurl), router);
				}
			}
		);
		
		app.get(domain.concat('/:filename'), function(req,res){
			if(encoder.authenticated(req)){
				res.download(settings.client.storage.concat('/',req.params['0']));
			}
			else{
				res.status(401).json({
					table:'null', 
					key: 'null',
					model:'null',
					contents:'null',
					issuer:'UPLOADER', 
					message: 'Not Authorized'
				});
			}
		});
		
		app.put(domain, function(req,res){
			if(encoder.authenticated(req)){
				if(req.body.rm){
					let dispose = 0;
					if(req.body.rm.length==0){
						res.json({
							table:'null', 
							key: 'null',
							model:'null',
							contents:0,
							issuer:'UPLOADER', 
							message: 'No file removed'
						});
					}
					else{
						for(let i in req.body.rm){
							let filename = settings.client.storage.concat('/', req.body.rm[i]);
							if (file.existsSync(filename)) { 
								file.unlink(filename, function(err){
									if((++dispose)>=req.body.rm.length){
										res.json({
											table:'null', 
											key: 'null',
											model:'null',
											contents:dispose,
											issuer:'UPLOADER', 
											message: dispose.toString().concat(' file(s) removed')
										});
									}
								});
							}
						};
					}
				}
				else{
					res.json({
						table:'null', 
						key: 'null',
						model:'null',
						contents:'null',
						issuer:'UPLOADER', 
						message: 'No files to remove'
					});
				}
			}
			else{
				res.status(401).json({
					table:'null', 
					key: 'null',
					model:'null',
					contents:'null',
					issuer:'UPLOADER', 
					message: 'Not Authorized'
				});
			}
		});
		
		app.post(domain, handler.any(), function (req,res) {
			if(encoder.authenticated(req)){
				let reply = [];
				let err = false;
				for(let i=req.files.length-1; !err && i>-1; i--){
					if (file.existsSync(settings.client.storage.concat('/', req.files[i].originalname))) {
						file.unlinkSync(
							settings.client.storage.concat('/', req.files[i].filename),
								function(){ err=true; }
						);
					}
					else{
						file.renameSync(
							settings.client.storage.concat('/', req.files[i].filename), 
							settings.client.storage.concat('/', req.files[i].originalname)
						);
						reply.push(req.files[i].originalname); 
					}
				};
				if(err){
					res.status(400).json({
						table:'null', 
						key: 'null',
						model:'null',
						contents:'null',
						issuer:'UPLOADER', 
						message: 'The file already exists'
					});
				}
				else{ res.json({length:req.files.length,file:reply}); }
			}
			else{
				res.status(401).json({
					table:'null', 
					key: 'null',
					model:'null',
					contents:'null',
					issuer:'UPLOADER', 
					message: 'Not Authorized'
				});
			}
		});
	};
	return { configure: setup };
})();