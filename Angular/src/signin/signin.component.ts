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
import { Headers } from '@angular/http';
import { Router } from '@angular/router';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import { HttpService } from '../http.service';
import { BufferService } from '../buffer.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
	
  err : string;
  state: boolean;
  check : string;
  
  constructor(private router: Router, private http: HttpService, private buffer: BufferService) {
	this.state = this.buffer.get()=='1';
  }

  ngOnInit() {
  }
  
  onClick(event, username, pwd):void{
	
	this.err='';
	if(this.buffer.get()=='0'){
	  if(username.value && pwd.value){
		this.http.post(this.buffer.getBaseUrl().concat('/login'), JSON.stringify({
			username:username.value, password:pwd.value
		}),{headers: new Headers({'Content-Type':'application/json'})}).toPromise()
		.then( response => {
		  let reply = response.json();
		  if(reply.contents!='null' && reply.message=='OK'){
			this.buffer.authorize(username.value);
		  	this.router.navigateByUrl(this.buffer.getBaseUrl().concat('/',this.buffer.getMainPage()));
	      }
		  else{
			this.err = reply.message;
		  }
		} ).catch(response => {this.err = response.json().message;});
	  }
	  else{
		this.err = 'Invalid username and/or password';
	  }
	}
	else{
	  if(pwd.value && this.check){
	    if(pwd.value==this.check){
		  this.http.put(this.buffer.getBaseUrl().concat('/signin'),
	  		JSON.stringify({
		  		table:'null', 
				model:'null',
				contents:[username.value, pwd.value], 
				issuer:'IFACE', 
				message:'Request for new user'
			}),{headers: new Headers({'Content-Type':'application/json'})}).toPromise()
			.then( response => {
				let reply = response.json();
				if(reply.contents=='1'){
					this.buffer.put('0');
					this.router.navigateByUrl(this.buffer.getBaseUrl().concat('/login'));
				}
				else{
					this.err = reply.message;
				}
			} ).catch(response => {this.err = response.json().message;});
	    }
	    else{
	      this.err = 'Passwords do not match';
	    }
	  }
	  else{
	    this.err = 'Invalid Password';
	  }
	}
  }
}
