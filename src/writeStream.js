var pump = require('pump')

const isStream = function(data){
    return data && data.pipe && typeof data.pipe === "function"
}

/**
 * Write text data if it is not written before
 * @param {*} data : content stream
 * @param {string} type : content-type
 * @param {boolean} safe : flag
 * @param {boolean} pipe : pipe content stream if already present
 */
module.exports = function(data, type, safe, pipe){
    if( ! (safe && this.data) || pipe ) { 
        if(data === null || data === undefined || !isStream(data) ){
            this.length(0);
            //this.end(null,406,"Unsupported type " + typeof data + " is given");
            throw Error("Unsupported type. You're trying to set non-stream data");
        }

        if(pipe && this.data && isStream(this.data) ){
            pump(this.data,data);
            this.data = data;
        }else{
            this.data = data;   
        }

        if(!this.type() && type){
            this.type(type);
        }
    } 
}