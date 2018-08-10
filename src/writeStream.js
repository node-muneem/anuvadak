var pump = require('pump')

const isStream = function(data){
    return data && data.pipe && typeof data.pipe === "function"
}

/**
 * Write stream if it is not written before
 * @param {object} data : content stream
 * @param {string} type : content-type
 * @param {boolean} safe : if response data is already set then don't overwrite 
 * @param {boolean} pipe : pipe content stream if already present
 */
module.exports = function(data, type, safe, pipe){

    if(data === null || data === undefined || !isStream(data) ){
        this.length(0);
        throw Error("Unsupported type. You're trying to set non-stream data");
    }else if( !this.data ){ //null, empty, 0, undefined
        this.data = data;
    }else if(safe){
            return;
    }else if(pipe){//safety is off, & this.data is present
        if( !isStream(this.data) ){
            throw Error("Unsupported type. You're trying to pipe stream data on non-stream data");
        }else{
            pump(this.data,data);
            this.data = data;
        }
    }else{
        this.data = data;
    }

    if(!this.type() && type){
        this.type(type);
    }
}