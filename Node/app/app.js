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
(function(){
	
    var web = require('http');
	var express = require('express');
	
	var app = express();
	var router = require('./router');
	var settings = require('./settings');
	var passport = require('./passport');
	var database = require('./database');
	
	let db = new database(settings.database);
	app.use(express.static(settings.client.folder));
	passport.configure(app, db, settings.session);
	router.configure(app, express, db, passport, settings);
	
	
    let server = web.createServer(app);
    server.on('error', function(err){ console.log(JSON.stringify(err)); });
    server.on('listening', function(){ console.log(server.address()); });

    server.listen( settings.client.port, settings.client.address );
})();