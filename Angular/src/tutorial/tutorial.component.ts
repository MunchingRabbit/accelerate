import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})
export class TutorialComponent implements OnInit {
  album: Array<string>;
  library:Array<string>;
  constructor() {
    this.album = [
			  "assets/S1.JPG",
			  "assets/S2.JPG",
			  "assets/S3.JPG",
			  "assets/S4.JPG",
			  "assets/S5.JPG",
			  "assets/S6.JPG",
			  "assets/S7.JPG"
	        ];
    this.library = [
			  "Create an \"EMPLOYEE\" table with columns \"ID\" and \"NAME\". An alert saying \"OK\" should display once the table is saved.",
			  "Create a \"TODO\" table with columns \"ID\",\"DESCRIPTIONS\" and \"REPORTEDBY\". "
			  +"The column \"REPORTEDBY\" is a foreign key linked to EMPLOYEE(ID). An alert saying \"OK\" should display once the table is saved.",
			  "Accelerate will generate the models for each table on saving. It is stored in the \"constructed\" folder in Accelerate. "
			  +"Move the models (javascript files) to the \"models\" as defined in the \"settings.js\" file.",
			  "Register the new models in \"app.module.ts\" of the Angular project. Each models "
			  +"URL can be found in their respective javascript models generated by Accelerate. Note that the Angular "
			  +"component used for these new models is called DataComponent.",
			  "List the new models with the navigation bar to make it accessible.",
			  "Re-build the Angular 4 web app with the new URL links and restart the node server",
			  "You can now perform CRUD operations on the new models through Accelerate or any other front-end application."
	        ];
  }

  ngOnInit() {
  }
  onClick(obj:number){
    let img = document.getElementById("screen") as HTMLImageElement;
    img.src=this.album[obj];
	document.getElementById("text").innerHTML=this.library[obj];;
    document.getElementById("gallery").style.display = "block";
  }
  onDone() {
    document.getElementById("gallery").style.display = "none";
  }
}
