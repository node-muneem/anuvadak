const { setType, setLength} = require("./util")
/**
 * Write Buffer data if it is not written before
 * @param {*} data : content
 * @param {string} type : content-type
 * @param {number|string} length : content-length
 */
module.exports = function(data, type, length, safe, append){
    if(data === null || data === undefined || !Buffer.isBuffer(data)){
        this.length(0);
        throw Error("Unsupported type. You're trying to set non-buffer data");
    }else if( !this.data ){ //null, empty, 0, undefined
        this.data = data;
    }else if(safe && !append){
            return;
    }else if(append){
        if( !Buffer.isBuffer(this.data) ){
            throw Error("Unsupported type. You're trying to append buffer to non-buffer.");
        }else{
            this.data = Buffer.concat([this.data, data]);
        }
    }else{
        this.data = data;
    }
    
    setType(this, type, "application/octet-stream");
    setLength(this, length, Buffer.byteLength(this.data))
}