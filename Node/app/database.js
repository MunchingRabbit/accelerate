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
	var mysql = require('mysql');
	
	let parse = function(queries){
		if(!queries.table){ return ''; }
		if(queries.find){
			let finder = 'SELECT '.concat((queries.filter||'*'),' FROM ', queries.table);
			if(queries.find){
				let i=0;
				for(let j in queries.find){
					if(i>0){finder = finder.concat(queries.op || ' AND ');}
					else{finder = finder.concat(' WHERE ');}
					i++; finder = finder.concat(j,'=',queries.find[j]);
				}
				return finder;
			}
			else{return '';}
		}
		else if(queries.create){
			let creator = 'INSERT INTO '.concat(queries.table, '(');
			if(queries.create){
				let model = queries.create;
				if(model.headers && model.headers.length>0){
					creator = creator.concat(model.headers, ') VALUES (');
					for(let j in model.values){ creator = creator.concat((j==0?'':', '),model.values[j]); }
					creator = creator.concat(');');
					return creator;
				}
				else{return '';} 
			}
			else{return '';}
		}
		else if(queries.update){
			let updater = 'UPDATE '.concat(queries.table);
			if(queries.update){ 
				let model = queries.update;
				if(model.values && model.conditions){
					let i=0;
					for(let j in model.values){
						if(i>0){updater = updater.concat(',');}
						else{updater = updater.concat(' SET ');}
						i++; updater=updater.concat(j,'=',model.values[j]);
					}i=0;
					for(let k in model.conditions){
						if(i>0){updater = updater.concat(queries.op || ' AND ');}
						else{updater = updater.concat(' WHERE ');}
						i++; updater=updater.concat(k,'=',model.conditions[k]);
					}
					return updater;
				}
				else{return '';} 
			}
			else{return '';}
		}
		else if(queries.remove){
			let remover = 'DELETE FROM '.concat(queries.table);
			if(queries.remove){
				let i=0;
				for(let j in queries.remove){
					if(i>0){remover = remover.concat(queries.op || ' AND ');}
					else{remover = remover.concat(' WHERE ');}
					i++; remover=remover.concat(j,'=',queries.remove[j]);
				}
				return remover;
			}
			else{return '';}
		}
		else{ return ''; }
	}
	
	function mysqldb(config){
		this.pool = mysql.createConnection(config); 
		this.pool.connect(function(err){ if(err){console.log(err);} return });
	};
	mysqldb.prototype.asString = function(value){return '\''.concat(value,'\'');};
	mysqldb.prototype.run = function(search, callback){
		let question = parse(search);
		if(question===''){if(callback){callback('Invalid Query');}}
		else{
			this.pool.query(question, function(err, docs, field){if(callback){ callback(err,docs,field); }});
		}
	};
	mysqldb.prototype.execute = function(string, callback){
		this.pool.query(string, function(err, docs, field){if(callback){ callback(err,docs,field); }});
	};
	
    return mysqldb;
})();