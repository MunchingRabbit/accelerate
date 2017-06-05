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

import { Component} from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from './http.service';
import { BufferService } from './buffer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title: string;
  public dropdownlist: Array<Object> = [
    //ADD MORE URL PATHS HERE
	//**********************//
	{url:this.buffer.getBaseUrl().concat('/utils'), title:'Builder'},
	{url:this.buffer.getBaseUrl().concat('/tutorial'), title:'Tutorials'}
  ];
  
  constructor(private router: Router, private http: HttpService, private buffer: BufferService){
	buffer.authorized().subscribe(string=>{this.title=string;});
  }
  
  onClick(event):void{
	this.http.delete(this.buffer.getBaseUrl().concat('/login/', event.target.text)).toPromise()
	  .then( response => {
		let reply = response.json();
		if(reply.contents=='1'){
			this.buffer.authorize('');
			this.router.navigateByUrl('/');
		}
		else{
			alert(reply.message);
			this.router.navigateByUrl('/');
		}
	  }).catch(response => {
		alert(response.json().message);
		this.router.navigateByUrl('/');
	  });
  }
  
  onRoute(event, param):void{
	this.router.navigateByUrl(param);
  }
}
