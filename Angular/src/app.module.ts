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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { ActivatedRoute, RouterModule, Routes } from '@angular/router';

import { FileSelectDirective } from 'ng2-file-upload';

import { HttpService } from './http.service';
import { BufferService } from './buffer.service';
import { BrokerService } from './broker.service';

import { AppComponent } from './app.component';

import { ErrorComponent } from './error/error.component';
import { SigninComponent } from './signin/signin.component';
import { HomeComponent } from './home/home.component';
import { BuilderComponent } from './builder/builder.component';
import { DataComponent } from './data/data.component';

//ADD MORE COMPONENTS HERE
//*********************//

const prefix:string = 'accelerate/api/alice';
const navigator : Routes = [
  { path: prefix+'/signin', component: SigninComponent },
  { path: prefix+'/login', component: SigninComponent },
  { path: prefix+'/utils', component: BuilderComponent, resolve:{ data:BrokerService }},
  
  //ADD MORE URL PATHS HERE
  //*********************//
  { path: '', component: HomeComponent },
  { path: '**', component: ErrorComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ErrorComponent,
    SigninComponent,
    HomeComponent,
	BuilderComponent,
	FileSelectDirective,
	DataComponent
	//ADD MORE COMPONENTS HERE
	//*********************//
  ],
  imports: [
	RouterModule.forRoot(navigator),
    BrowserModule,
    FormsModule,
	HttpModule,
	JsonpModule
  ],
  providers: [BufferService, BrokerService, HttpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
