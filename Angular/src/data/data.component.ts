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

import { Injectable, Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Headers } from '@angular/http';

import {Observable} from 'rxjs/Rx';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import { FileUploader } from 'ng2-file-upload';

import { HttpService } from '../http.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})

export class DataComponent implements OnInit {
  packet:any;
  pageurl:string;
  data:Array<any>;
  uploader:FileUploader;
  
  edit:string;
  title:string;
  
  pointer:number;
  
  constructor(
    private route: ActivatedRoute, 
	private http: HttpService
  ){
	let ptr = this;
	let path:string = '';
	this.route.data.subscribe(packet => {this.packet = packet['data']});
	route.url.subscribe(segment => {
      segment.forEach(part => { path = path.concat('/',part.path); });
	}); 
	this.pageurl = path;
	this.uploader = new FileUploader({
	  url: this.pageurl.concat('/files/uploads'),
	  removeAfterUpload:true
	});
	this.uploader.onCompleteAll = function(){alert("Files uploaded");}; 
	this.uploader.onAfterAddingFile = function(fileItem){ ptr.data[ptr.pointer]=fileItem.file.name; }
  }
  
  ngOnInit() {
  }
  
  private setObjectParameters(action:string, name:string):void{
	this.edit = name;
	this.title = action; 
  }
  
  private getObjectIdentifier(object:any):string{
	let id = [];
	for(let i in this.packet.key){
	  id.push(object[this.packet.model[this.packet.key[i]].name]);
	}
	return id.join(',');
  }
  
  private createNewObject():Array<any>{
	  let obj = [];
	  for(let i in this.packet.model){
      switch(this.packet.model[i].type){
        case 'NUMB': case 'DDNM': case 'DTTM': obj[i] = 0; false; break;
        default: obj[i] = '';
      }
    }
	return obj;
  }
  
  private parseObject(model:any):Array<any>{
	let obj = [];
	for(let i in this.packet.model){
      obj[i] = (model[this.packet.model[i].name]);
    }
	return obj;
  }
  
  private createPacket(mssg:string):string{
	let headers:Array<string> = []; 
	let contents:Array<string> = [];
	for(let i in this.packet.model){
      switch(this.packet.model[i].type){
		case 'NUMB': case 'DDNM': case 'DTTM': contents[i] = this.data[i].toString(); break;
		default: contents[i] = '"'.concat(this.data[i].toString(),'"');
	  }
      headers[i] = this.packet.model[i].name;
    }
	return JSON.stringify({
	  table:this.packet.table, key:this.packet.key, model:headers, contents:contents, message:mssg
	});
  }
  
  onClick(event, open:boolean):void{
	if(open){
      this.uploader.clearQueue();
	  let param = document.getElementsByClassName('_file-uploader');
	  for (let i=param.length; i>-1; i--) {if(param[i]){(<HTMLInputElement>param[i]).value='';}}
	}
	document.getElementById('_editor').style.display=open?'block':'none';
  };
  
  onFileClick(event, index):void{this.pointer=index;}
  
  onAdd(event, model):void{
    this.data = this.createNewObject();
	this.setObjectParameters('NEW','');
    this.onClick(event, true);
  };
  onEdit(event, model):void{
	this.data = this.parseObject(model);
	this.setObjectParameters('EDIT','');
    this.onClick(event, true);
  };
  onDelete(event, model):void{
	this.data = this.parseObject(model);
	this.setObjectParameters(
	  'DELETE',this.getObjectIdentifier(model));
    this.onClick(event, true);
  };
  
  onDone(event):void{
	switch(this.title){
		case 'NEW' : {
			this.http.put(this.pageurl, this.createPacket('New'),
				{headers: new Headers({'Content-Type':'application/json'})}).toPromise()
			.then( response =>{
				this.packet = response.json();
				if(this.uploader.queue.length>0){ this.uploader.uploadAll(); }
			}).catch(response => {alert(response.json().message);});
		} break;
		case 'EDIT': {
			this.http.post(this.pageurl, this.createPacket('Edit'),
				{headers: new Headers({'Content-Type':'application/json'})}).toPromise()
			.then( response => {
				let data = response.json();
				for(let i in this.packet.contents){
					let compare = true;
					for(let j=this.packet.key.length-1; compare && j>-1; j--){
						compare = 
							this.packet.contents[i][this.packet.model[this.packet.key[j]].name]
								===data.contents[this.packet.model[this.packet.key[j]].name]
					} if(compare){this.packet.contents.splice(i,1,data.contents); break;}
				} if(this.uploader.queue.length>0){ this.uploader.uploadAll(); } 
			}).catch(response => {{alert(response.json().message);}});
		} break;
		case 'DELETE': {
			this.http.delete(this.pageurl.concat('/',this.edit)).toPromise()
			.then( response =>{
				let data = response.json();
				for(let i in this.packet.contents){
					let compare = true;
					for(let j=this.packet.key.length-1; compare && j>-1; j--){
						compare = 
							this.packet.contents[i][this.packet.model[this.packet.key[j]].name]
								=== data.contents[this.packet.model[this.packet.key[j]].name]
					} if(compare){this.packet.contents.splice(i,1); break;}
				}
				let queue:string = '';
				for(let i in this.packet.model){
				  if(this.packet.model[i].type=='FILE'){
					queue = queue.concat((queue.length===0?'':','),'"',this.data[i],'"');
				  }
				};
				if(queue.length>0){
				  this.http.put(
				    this.pageurl.concat('/files/uploads'),
				    '{"rm" : ['.concat(queue, ']}'),
				    {headers: new Headers({'Content-Type':'application/json'})}
				  ).toPromise().then( response =>{
				  	alert(response.json().message);
				  }).catch(response => {{alert(response.json().message);}});
				}
			}).catch(response => {{alert(response.json().message);}});
		} break;
		default:
	}
	this.onClick(event, false);
  };
  
  
}
