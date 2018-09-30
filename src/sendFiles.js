const send = require('send');
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
    this.writeFile = function(fileName){
        
        if(globalOptions.ignoreRequestPath && !fileName){
            return this.error( new Error("File name is required to answer the client.") );
        }
        this.data = send( this._for._native, fileName || this._for.path, globalOptions )
            .on('error', err => {
                if(err.code === "ENOENT"){
                    globalOptions.ignore404 || this.resourceNotFound();
                    //this.resourceNotFound();
                }else{
                    this.error(err);
                }
            });
        //send( this._for._native, fileName || this._for.path, opt ).pipe( this._native);
    }
}

function config(muneem, globalOptions){
    const sendFile = new SendFile(globalOptions);
    muneem.addToAnswer("sendFile", sendFile.writeFile);
}

module.exports = config;