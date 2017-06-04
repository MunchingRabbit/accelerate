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
	var async = require('async');
    return { 
		datatype: {
			String:'STRG',
			Number:'NUMB',
			File:'FILE',
			Datetime:'DTTM',
			DropdownString: 'DDST',
			DropdownNumber: 'DDNM',
		},
		parse: function(integer, multi){
			if(integer<5){return multi===true?'DDNM':'NUMB';}
			else if(integer<6){return 'DTTM';}
			else if(integer<19) {return multi===true?'DDST':'STRG';}else{return 'FILE';}
		},
		controller: function Controller(db, model, obfuscate){
			this.get = function(req,res){
				if(obfuscate.authenticated(req)){
					async.each(model.columns, function(column, call){
						if(column.dependency!=='' && column.source!==''){
							db.run(
								{table:column.source,find:{},filter:column.filter.join(',')},
									function(err, docs, field){
										if(err){column.list = [];}else{column.list=docs;column.source=""};call();
									}
							);
						}else{call();}
					},
					function(err){
						db.run({table:model.databasetable,find:{}}, 
							function(err, docs, field){ 
								if(err){
									res.status(400).json({
										table:model.databasetable, 
										key: model.primarycolumn,
										model:'null',
										contents:'null',
										issuer:'GET', 
										message: err.code
									});
								}
								else{
									res.json({
										table:model.databasetable, 
										key: model.primarycolumn,
										model:model.columns,
										contents:docs,
										issuer:'GET', 
										message: 'Returned '+docs.length+' rows'
									});
								}
							}
						);
					});
				}
				else{
					res.status(401).json({
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
				if(obfuscate.authenticated(req)){
					let index = req.body.model.indexOf('UPDATEDBY');
					if(index>-1){req.body.contents[index] = '"'.concat(req.user.contents,'"');}
					index = req.body.model.indexOf('LASTUPDATED');
					if(index>-1){req.body.contents[index] = 'unix_timestamp(now())';}
					
					db.run({table:model.databasetable,create:{
						headers:req.body.model, 
						values:req.body.contents
					}}, 
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
								db.run({table:model.databasetable,find:{}}, 
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
												model:model.columns,
												contents:docs,
												issuer:'PUT', 
												message: docs.length
											});
										}
									}
								);
							}
						}
					);
				}
				else{
					res.status(401).json({
						table:model.databasetable, 
						key: model.primarycolumn,
						model:'null',
						contents:'null',
						issuer:'PUT', 
						message: 'Not Authorized'
					});
				}
			};
			this.post = function(req,res){
				if(obfuscate.authenticated(req)){
					let finder = {};
					for(let i in model.primarycolumn){
						finder[model.columns[model.primarycolumn[i]].name] = req.body.contents[model.primarycolumn[i]];
					}
					finder.LASTUPDATED = req.body.contents[req.body.model.indexOf('LASTUPDATED')];
					async.waterfall(
						[
							function(callback){
								db.run({table:model.databasetable,find:finder},
									function(err,docs,field){callback(err,docs,field);});
							},
							function(docs, field, callback){
								if(docs.length===1){
									let changes = {}
									for(let i=0; i<req.body.model.length; i++){
										if(i!==req.body.key){
											changes[req.body.model[i]] = req.body.contents[i];
										}
									}
									changes.LASTUPDATED = 'unix_timestamp(now())';
									db.run({table:model.databasetable,update:{
										values: changes,
										conditions: finder
									}},function(err,docs,field){callback(err,docs,field);});
								}
								else{
									callback('The record has since changed since the last query');
								}
							},
							function(docs, field, callback){
								delete finder.LASTUPDATED;
								db.run({table:req.body.table,find:finder},function(err,docs,field){callback(err,docs,field);});
							},
						],
						function(err, docs, field){
							if(err){
								res.status(400).json({
									table:model.databasetable, 
									key: model.primarycolumn,
									model:'null',
									contents:'null',
									issuer:'POST', 
									message: err
								});
							}
							else{
								res.json({
									table:model.databasetable, 
									key: model.primarycolumn,
									model:model.columns,
									contents:docs[0],
									issuer:'POST', 
									message: 'Updated'
								});
							}
						}
					);
				}
				else{
					res.status(401).json({
						table:model.databasetable, 
						key: model.primarycolumn,
						model:'null',
						contents:'null',
						issuer:'PUT', 
						message: 'Not Authorized'
					});
				}
			};
			this.delete = function(req,res){
				if(obfuscate.authenticated(req)){
					let finder = {};
					let keys = req.params.id.split(',');
					for(let i in keys){ 
						let type = model.columns[i].type;
						finder[model.columns[i].name]=(
							type==='STRG'||type==='DDST'||type==='FILE')?db.asString(keys[i]):keys[i]; 
					}
					db.run({table:model.databasetable,find:finder}, 
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
								let removedModel = docs[0];
								db.run({table:model.databasetable,remove:finder},
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
											res.json({
												table:model.databasetable, 
												key: model.primarycolumn,
												model:model.columns,
												contents:removedModel,
												issuer:'DELETE', 
												message: 'Removed '+docs.affectedRows+' rows'
											});
										}
									}
								);									
							}
						}
					);
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
	}
})();
