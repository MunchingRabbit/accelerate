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
	
	let eol = '\r\n';
	let file = require('fs');
	let async = require('async');
	let data = require('./datatypes');
	
	function Model(){

		this.baseurl = '/utils';
		this.geturl = '/';
		this.puturl = '/';
		this.posturl = '/';
		this.deleteurl = '/';
		
		this.databasetable = '';
		this.primarycolumn = -1;
		this.columns = [];
		this.getModel = function(values, callback){
		}
	};
	
	function Controller(db, model, obfuscate){
		
		this.get = function(req,res){
			if(obfuscate.authenticated(req)){
				db.execute('SHOW TABLES', function(err, docs, field){
					let data = [];
					let reply = [];
					for(let i in docs){ for(let j in docs[i]){ data.push(docs[i][j]); }}
					
					async.each(data, function(table, callback){
						db.execute('SHOW COLUMNS FROM '.concat(table), function(err,docs,field){
							if(table.toLowerCase()!=='users' && !err){
								for(let k of docs){reply.push(table.concat('(',k.Field,')'))};
							} callback();
						});}, 
						function(err){
							if(err){
								res.status(400).json({
									table:'null', 
									key: 'null',
									model:'null',
									contents:'null',
									issuer:'GET', 
									message: err
								});
							}
							else{
								res.json({
									table:'null', 
									key: 'null',
									model:'null',
									contents:reply,
									issuer:'GET', 
									message: 'List of Tables'
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
				let query = 'CREATE TABLE '.concat(req.body.table, '(',req.body.message,')');
				db.execute(query, function(err, docs, field){
					if(err){
						res.status(400).json({
							table:'null', 
							key: 'null',
							model:'null',
							contents:'null',
							issuer:'PUT', 
							message: err.code
						});
					}
					else{
						let filename = req.body.table.toLowerCase()
						file.writeFile("./constructed/".concat(filename,'.sql'), query, function(err) {
							if(err) { console.log(err);  }
							else{
								let header = '';
								let primaryColumn = [];
								for(let i in req.body.model){
									if(req.body.model[i].primary){primaryColumn.push(i);}
									let prereq = req.body.model[i].dependency
									header = header.concat((header===''?'':','),eol,'\t\t\t{',eol,
										'\t\t\t\tindex:',i.toString(),',',eol,
										'\t\t\t\tname:\'',req.body.model[i].name,'\',',eol,
										'\t\t\t\teditable:true,',eol,
										'\t\t\t\ttype:\'',data.parse(req.body.model[i].type, prereq!==''),'\',',eol,
										'\t\t\t\tdependency:\'',
											(prereq===''?'':prereq.substring(prereq.indexOf('(')+1, prereq.indexOf(')')))
											,'\',',eol,
										'\t\t\t\tsource:\'',(prereq===''?'':prereq.substring(0,prereq.indexOf('('))),'\',',eol,
										'\t\t\t\tlist:[]',',',eol,
										'\t\t\t\tfilter:[]',',',eol,
										'\t\t\t\tcorrect:function(data){return true;}',',',eol,
									'\t\t\t}');
								}
								header = header.concat((header===''?'':','),eol,'\t\t\t{',eol,
									'\t\t\t\tindex:',req.body.model.length.toString(),',',eol,
									'\t\t\t\tname:\'UPDATEDBY\',',eol,
									'\t\t\t\teditable:false,',eol,
									'\t\t\t\ttype: data.datatype.String,',eol,
									'\t\t\t\tdependency:\'\',',eol,
									'\t\t\t\tsource:\'\',',eol,
									'\t\t\t\tlist:[]',',',eol,
									'\t\t\t\tfilter:[]',',',eol,
									'\t\t\t\tcorrect:function(data){return true;}',',',eol,
								'\t\t\t}');
								header = header.concat((header===''?'':','),eol,'\t\t\t{',eol,
									'\t\t\t\tindex:',(req.body.model.length+1).toString(),',',eol,
									'\t\t\t\tname:\'LASTUPDATED\',',eol,
									'\t\t\t\teditable:false,',eol,
									'\t\t\t\ttype: data.datatype.Datetime,',eol,
									'\t\t\t\tdependency:\'\',',eol,
									'\t\t\t\tsource:\'\',',eol,
									'\t\t\t\tlist:[]',',',eol,
									'\t\t\t\tfilter:[]',',',eol,
									'\t\t\t\tcorrect:function(data){return true;}',',',eol,
								'\t\t\t}');
								file.writeFile("./constructed/".concat(filename,'.js'),
										'/*'.concat(eol,'accelerate headers:',eol,'{',eol,
											'codename:\'Alice\',',eol,
											'version:\'1.0\',',eol,
											'timestamp:\'',new Date().toISOString(),'\'',eol,'}*/',eol,eol,
											'\'use strict\';',eol,
											'module.exports = (function(){',eol,eol,
											'\tlet data = require(\'./datatypes\');',eol,
											'\tfunction Model(){',eol,eol,
											'\t\tthis.baseurl = \'/',filename,'\';',eol,
											'\t\tthis.geturl = \'/\';',eol,
											'\t\tthis.puturl = \'/\';',eol,
											'\t\tthis.posturl = \'/\';',eol,
											'\t\tthis.deleteurl = \'/:id\';',eol,eol,
											'\t\tthis.databasetable = \'',req.body.table,'\';',eol,
											'\t\tthis.primarycolumn = [',primaryColumn.join(','),'];',eol,
											'\t\tthis.columns = [',header,eol,'\t\t];',eol,
											'\t\tthis.getModel = function(values, callback){}',eol,'\t}',eol,eol,
											'\t/*function controller(){',eol,'\t\tthis.get = function(req,res){}',eol,eol,
											'\t\tthis.put = function(req,res){}',eol,eol,
											'\t\tthis.post = function(req,res){}',eol,eol,
											'\t\tthis.delete = function(req,res){}',eol,eol,'\t}*/',eol,eol,
											'\treturn {',eol,
											'\t\tmodel : Model,',eol,
											'\t\tcontroller : data.controller,',eol,
											'\t\tscaffold: {arbiter:false}',eol,
											'\t}',eol, '})();', eol,
											'/*accelerate footers:{version:\'1.0\'}*/'
											), 
									function(err){
										if(err) { console.log(err);  }
									});
							}
							res.json({
								table:'null', 
								key: 'null',
								model:'null',
								contents:'null',
								issuer:'PUT', 
								message: 'OK'
							});
						});
					}
				});
			}else{
				res.status(401).json({
					table:'null', 
					key: 'null',
					model:'null',
					contents:'null',
					issuer:'PUT', 
					message: 'Not Authorized'
				});
			}
		};
		this.post = function(req,res){
			res.status(501).json({
				table:'null', 
				key: 'null',
				model:'null',
				contents:'null',
				issuer:'POST', 
				message: 'Not implemented'
			});
		};
		this.delete = function(req,res){
			res.status(501).json({
				table:'null', 
				key: 'null',
				model:'null',
				contents:'null',
				issuer:'DELETE', 
				message: 'Not implemented'
			});
		};
	}
	
    return {
		model:Model,
		controller:Controller,
		scaffold: {arbiter:false}
	}
})();