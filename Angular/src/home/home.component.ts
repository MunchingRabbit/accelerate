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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '../http.service';
import { BufferService } from '../buffer.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  
  constructor(private router: Router, private http: HttpService, private buffer: BufferService) {}

  ngOnInit() {
  }
  
  onClick(event):void{
	this.buffer.put(event.target.value);
	this.http.get(this.buffer.getBaseUrl().concat('/login')).toPromise()
	.then(response=>{ 
	  let reply = response.json();
	  if(reply.contents==='null'){
		this.router.navigateByUrl( 
		  this.buffer.getBaseUrl().concat(event.target.value==='1'?'/signin':'/login')
		);
	  }
	  else{
		this.buffer.authorize(reply.contents);
		this.router.navigateByUrl( 
		  this.buffer.getBaseUrl().concat('/',this.buffer.getMainPage())
		);
	  }
	});
	
  }
}
