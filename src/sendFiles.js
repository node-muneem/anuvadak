const send = require('send');
const path = require('path');
const { isFileExist, isDirectoryExist} = require('./util');

function SendFile(globalOptions){
    if( !globalOptions) globalOptions = {};
    if( !globalOptions.root) throw Error("You've set no path for static files");
    if( !isDirectoryExist(globalOptions.root) ) throw Error("You've set an incorrect path for static files");

    /**
     * Provide the filename to write or it'll be picked from the path
     * @param {string} fileName 
     * @param {object} options 
     */
    this.writeFile = function(fileName, routeOptions){
        if(typeof fileName === 'object'){
            routeOptions = fileName;
            fileName = "";
        }
        const routeOpts = Object.assign({}, globalOptions, routeOptions);
        const routeRoot = routeOpts.from || routeOpts.root;
        if( routeRoot && !isDirectoryExist(routeRoot) ){//absolute path
            routeOpts.root = path.join( globalOptions.root, routeOpts.root);
        }

        if(routeOpts.ignoreRequestPath && !fileName){
            return this.error( new Error("File name is required to answer the client.") );
        }
        this.data = send( this._for._native, fileName || this._for.path, routeOpts )
            .on('error', err => {
                if(err.code === "ENOENT"){
                    routeOpts.ignore404 || this.resourceNotFound();
                    //this.resourceNotFound();
                }else{
                    this.error(err);
                }
            });
        
            return this.data;
        //send( this._for._native, fileName || this._for.path, opt ).pipe( this._native);
    }
}

function config(muneem, globalOptions){
    const sendFile = new SendFile(globalOptions);
    muneem.addToAnswer("sendFile", sendFile.writeFile);
    muneem.addToAnswer("asFile", sendFile.writeFile);//alias
}

module.exports = config;