# Accelerate v1.0
![Accelerate](https://github.com/MunchingRabbit/accelerate/blob/master/accelerate.PNG)

## A MyEAN boilerplate with angular-cli
Accelerate is a platform for developing and deploying REST-ful
APIs as fast as the developers could think of them. It is
built on MySQL, Express, Angular 4 and Node implementations, and 
generates all the necessary models/controllers required for REST. 
All generated models/controllers are also fully customizable
to suit any additional requirements. 

## Prerequisites
1) Node, Express, MySQL Database and angular-cli
2) ng2-file-upload (https://github.com/valor-software/ng2-file-upload)

## Experience level required
- [x] Setup and install MySQL Database, Node, Express and angular-cli
- [x] Javascript and Typescript literacy is preferable

## Getting Started
1) Download the Accelerate v1.0 repository. 
   (npm & docker packages coming soon...)
2) Extract Accelerate into a folder "\<your folder name\>" of your 
   choice. 
3) Navigate to the folder "\<your folder name\>" using
   the command line interface and type: `npm install` to install 
   the node dependencies.
4) Create a new Angular 4 project inside the folder 
   "\<your folder name\>" by typing: `ng new <your webapp name>`
5) Navigate into the folder of "\<your webapp name\>" and install 
   ng2-file-upload by typing: `npm install --save ng2-file-upload`
6) Copy the "w3css.css" file found in the folder "\<your folder name\>/Angular"
   into the "\<your webapp name\>/src" folder
7) Edit the ".angular-cli.json" file to include the "w3css.css" file under 
   the scripts tag.
8) Compile the Angular 4 project by typing :`ng build`
9) Copy the contents of the folder "\<your folder name\>/Angular/src" found 
   in Accelerate into the "\<your webapp name\>/src/app" folder of your Angular 4
   web app. Replace all the files inside the "\<your webapp name\>/src/app"
   folder when prompted.
10) Compile the Angular 4 project again by typing :`ng build`
11) Navigate to "\<your folder name\>/app" and edit the file called 
   settings.js, changing the following values;
   - [x] database.host : the address of MySQL Database
   - [x] database.user : username for the DB
   - [x] database.password : password of the DB
   - [x] client.folder : the path to the `dist` folder generated
         by angular-cli after successfully building the web app
12) Run "accelerate-setup.sql" in MySQL database.
13) Type: `npm start` from "\<your folder name\>" to start the server.
13) Sign-Up (uses passport-local) and start using Accelerate 
    to speed up your development cycles. :tada:

## FAQ
1) What the hell is this?
>It's a program/bilerplate which will generate generic MVC models
for both the front-end and ~~backside~~ back-end of your system.
2) Who can use this?
>Accelerate was designed for both developers and end-users in mind.
It was built for ~~desperate students~~ developers off the shelf but with 
some ~~twerking~~ tweaking it can also serve as an end-user system.
