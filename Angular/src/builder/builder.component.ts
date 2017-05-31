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
import { ActivatedRoute } from '@angular/router';
import { Headers } from '@angular/http';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

import { HttpService } from '../http.service';

interface ModelStructure{
	name:string;
	type:number;
	primary:boolean;
	dependency:string;
}

interface MySQLStructure{
	name:string;
	datatype:number;
	notNull:boolean;
	isPrimaryKey:boolean;
	isForeignKey:boolean;
	foreignTable:string;
	isUnique:boolean;
	hasCheck:boolean;
	check:string;
	hasDefault:boolean;
	defaultvalue:string;
}

@Component({
  selector: 'app-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.css']
})
export class BuilderComponent implements OnInit {
  
  resolved:any;
  pageurl:string;
  table_name:string;
  number_of_columns:number;
  columns:Array<MySQLStructure>;
  datatype_list:Array<string> = [
	'INT',
	'TINYINT',
	'SMALLINT',
	'MEDIUMINT',
	'BIGINT',
	'TIMESTAMP',
	'CHAR',
	'CHAR(5)',
	'CHAR(10)',
	'CHAR(15)',
	'CHAR(25)',
	'VARCHAR(25)',
	'VARCHAR(50)',
	'VARCHAR(75)',
	'VARCHAR(100)',
	'VARCHAR(150)',
	'VARCHAR(200)',
	'VARCHAR(250)',
	'TEXT',
    'FILE(25)',
	'FILE(50)',
	'FILE(75)',
	'FILE(100)'	
  ];
  
  constructor(
    private route: ActivatedRoute, 
	private http: HttpService
  ){
	let urlpath:string = '';
	route.url.subscribe(segment => {
      segment.forEach(part => { urlpath = urlpath.concat('/',part.path); });
	}); 
	this.pageurl = urlpath;
	this.route.data.subscribe(packet => {this.resolved = packet['data'];}); this.onClick(null);
  }

  ngOnInit() {
  }
  
  onDone(event){
	let primarykey:string = '';
	let foreignkey:string = '';
	let sqlrows:Array<string> = [];
	let headers:Array<ModelStructure> = [];
	
	for(let cols of this.columns){
	  let header:ModelStructure = {
		name:cols.name.toUpperCase(), type:cols.datatype, primary:false, dependency:''
	  };
	  if(cols.isPrimaryKey){ 
	    header.primary=true; 
		primarykey = primarykey.concat(',',cols.name.toUpperCase());
	  }
	  if(cols.isForeignKey){
		header.dependency = cols.foreignTable.toUpperCase();
		foreignkey = foreignkey.concat(
		  ', FOREIGN KEY ('
		  ,cols.name.toUpperCase(),
		  ') REFERENCES ',
		  cols.foreignTable.toUpperCase()
		);
	  }
	  headers.push(header);
	  sqlrows.push(cols.name.toUpperCase().concat(
		' ',
		this.datatype_list[cols.datatype].replace('FILE','VARCHAR'), 
		(cols.notNull?' NOT NULL':''), 
		(cols.isUnique?' UNIQUE':''), 
		(cols.hasCheck?' CHECK '.concat(cols.check):''), 
		(cols.hasDefault?' DEFAULT '.concat(cols.defaultvalue.toUpperCase()):''), 
	  ));
	}
	let envelope = JSON.stringify({
		table:this.table_name.toUpperCase(),key:'null', model:headers, contents:'null', 
	      message:sqlrows.join(', ').concat(', UPDATEDBY VARCHAR(100) NOT NULL, LASTUPDATED BIGINT NOT NULL', foreignkey,
	        ', PRIMARY KEY (',(primarykey.length>0?primarykey.substring(1):''),')')
	});
	
	this.http.put(this.pageurl, 
	  envelope, {headers: new Headers({'Content-Type':'application/json'})}).toPromise()
	.then( response =>{ 
	  if(response.json().message==='OK'){
	    this.http.get(this.pageurl, 
		  {headers: new Headers({'Content-Type':'application/json'})}).toPromise().then(
		    res => { this.resolved = res.json(); alert('OK');}
		  ).catch(res => {alert(res.json().message);});
	  }
	}).catch(response => {alert(response.json().message);});
  }
  
  onClick(event){
	this.table_name = '';
	this.number_of_columns = 1;
	this.columns = Array(this.number_of_columns).fill(
	  {
		name:'',
		datatype:0,
		notNull:false,
		isPrimaryKey:false,
		isForeignKey:false,
		foreignTable:'',
		isUnique:false,
		hasCheck:false,
		check:'',
		hasDefault:false,
		defaultvalue:''
      }
	);
  }
  
  columnChanged(event){
	this.number_of_columns = event.target.value;
	for(let i = this.columns.length-1; i>=this.number_of_columns; i--){
	  this.columns.splice(i,1);
	}
	for(let i=this.columns.length; i<this.number_of_columns; i++){
	  this.columns.push({
		name:'',
		datatype:0,
		notNull:false,
		isPrimaryKey:false,
		isForeignKey:false,
		foreignTable:'',
		isUnique:false,
		hasCheck:false,
		check:'',
		hasDefault:false,
		defaultvalue:''
      });
	}
  }
}