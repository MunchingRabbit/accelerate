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
	
	let data = require('./datatypes');
	
	function Model(){

		this.baseurl = '';
		this.geturl = '/login';
		this.puturl = '/signin';
		this.posturl = '/login';
		this.deleteurl = '/login/:id';
		
		this.mainurl = '/accelerate/api/alice/login';
		this.retryurl = '/accelerate/api/alice/login';
		
		this.databasetable = 'USERS';
		this.primarycolumn = 0;
		this.columns = [
			{
				index:0, name:'USERNAME', 
				editable:true, type:data.datatype.String,
				dependency:'', source:'', list:[], filter:[],
				correct:function(data){ return data.toString().trim()!==''; }
			},
			{
				index:1, name:'PASSWD', 
				editable:true, type:data.datatype.String,
				dependency:'', source:'', list:[], filter:[],
				correct:function(data){ return data.toString().trim()!==''; }
			},
			{
				index:2, name:'PUBLICKEY',
				editable:false, type:data.datatype.String,
				dependency:'', source:'', list:[], filter:[],
				correct:function(data){ return data.toString().trim()!==''; }
			},
		];
		this.getModel = function(values, callback){
			let frame = {};
			for(let i in this.columns){
				let element = this.columns[i];
				if(element.editable){
				  if(element.correct(values[i])){frame[element.name]=values[i];}
				  else{
					if(callback){callback(true, {
						table:this.databasetable, 
						key: this.primarycolumn,
						contents:'null',
						message:'Invalid entry at index '+i
					});}
				  }
				}
				else{ frame[element.name] = 'null'; }
			};
			if(callback){callback(false, {
				table:this.databasetable, 
				key: this.primarycolumn,
				contents:[frame],
				message:'New model(s) created'
			});}
		}
	};
	
	function Controller(db, model, obfuscate, passport){
		
		this.get = function(req,res){
			if(obfuscate.authenticated(req)){
				res.json({
					table:model.databasetable, 
					key: model.primarycolumn,
					model:'null',
					contents:req.user.contents,
					issuer:'GET', 
					message: 'OK'
				});	
			}
			else{
				res.json({
					table:model.databasetable, 
					key: model.primarycolumn,
					model:'null',
					contents:'null',
					issuer:'GET', 
					message: 'Not Authorized'
				});
			}
		};
		this.put = function(req,res){
			let entry = req.body.contents; 
			model.getModel(entry, function(err, docs){
				if(err){ 
					docs.model='null';
					docs.issuer = 'MODEL'; 
					res.status(400).json(docs); 
				}
				else{
					let header = [];
					let value = [];
					model.columns.forEach(function(element){
						header.push(element.name); 
						value.push(db.asString(docs.contents[0][element.name]));
					});
					db.run({table:model.databasetable,
						create:{headers:header, values:[value]}},
							function(err, docs, field){ 
								if(err){
									res.status(400).json({
										table:model.databasetable, 
										key: model.primarycolumn,
										model:'null',
										contents:'null',
										issuer:'PUT', 
										message: err.code
									});
								}
								else{
									res.json({
										table:model.databasetable, 
										key: model.primarycolumn,
										model:'null',
										contents:docs.affectedRows.toString(),
										issuer:'PUT', 
										message: docs.affectedRows.toString().concat(" new row(s)")
									});
								}
							}
					);
				}
			});
		};
		this.post = passport.authenticate("local",{successRedirect:model.mainurl,failureRedirect:model.retryurl});
		this.delete = function(req,res){
			if(obfuscate.authenticated(req)){
				if(req.params.id==='Delete Account'){
					let item = {};
					item[model.columns[0].name] = db.asString(req.session.passport.user);
					db.run({table:model.databasetable,remove:item},
						function(err, docs, field){ 
							if(err){
								res.status(400).json({
									table:model.databasetable, 
									key: model.primarycolumn,
									model:'null',
									contents:'null',
									issuer:'DELETE', 
									message: err.code
								});
							}
							else{
								req.logout(); 
								req.session.destroy();
								res.json({
									table:model.databasetable, 
									key: model.primarycolumn,
									model:'null',
									contents:docs.affectedRows,
									issuer:'DELETE', 
									message: docs.affectedRows.toString().concat(" less row(s)")
								});
							}
						}
					);
				}
				else{
					req.logout(); 
					req.session.destroy();
					res.json({
						table:model.databasetable, 
						key: model.primarycolumn,
						model:'null',
						contents:'1',
						issuer:'DELETE', 
						message: 'Logout'
					});
				}
			}
			else{
				res.status(401).json({
					table:model.databasetable, 
					key: model.primarycolumn,
					model:'null',
					contents:'null',
					issuer:'DELETE', 
					message: 'Not Authorized'
				});
			}
		};
	}
	
    return {
		model:Model,
		controller:Controller,
		scaffold: {arbiter:true}
	}
})();
