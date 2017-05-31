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
    return {
		/*******************DATABASE SETTINGS***********************/
		database:{
			host     : '127.0.0.1',//<Location of the MySQL server>
			user     : 'user',//<Database user>
			password : 'user',//<Database password>
			database : 'ACCELERATE'//<Database name>
		},
		/***********************************************************/
		
		/*********************MODELS FOLDER*************************/
		models: 'E:/fakepath/models',//<Folder where all the nodejs models are kept>
		/***********************************************************/
		/*******************SESSIONS SETTINGS***********************/
		session:{
			keyword:'keyboard cat',//<Session secret>
			options:{
				expiration: 15*60*1000,
				createDatabaseTable: true,
				connectionLimit: 1,
				//<Mandatory mysql-express-store settings>
				schema: {
					tableName: 'SESSIONS',
					columnNames: {
						session_id: 'SESSIONID',
						expires: 'EXPIRY',
						data: 'CONTENTS'
					}
				}
			}
		},
		/***********************************************************/
		/******************CLIENT-SIDE SETTINGS*********************/
		client:{
			address:'127.0.0.1',//<Server address>
			port: 9000,//<Port number>
			baseurl: '/accelerate/api/alice', //<Base url>
			folder: 'E:/fakepath/angular/dist',//<Folder containing the angular web app>
			fileurl: '/*/files/uploads',//<Url extension for file uploads>
			storage:'E:/fakepath/data'//<Folder to store/retrive any file uploads/downloads>
		}
		/***********************************************************/
	}
})();