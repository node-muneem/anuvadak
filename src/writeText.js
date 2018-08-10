const { setType, setLength} = require("./util")

/**
 * Write text data if it is not written before. Content type will not be set if it is already set
 * @param {*} data : content
 * @param {string} type : content-type
 * @param {number} length : content-length
 * @param {boolean} append : append content if already present
 */
module.exports = function(data, type, length, safe, append){
    if( typeof data === "number"){
        data += '';
    }else if( typeof data === "string"){
        //do nothing
    }else{
        this.length(0);
        throw Error("Unsupported type. You're trying to set non-text data");
    }

    if( !this.data ){ //null, empty, 0, undefined
        this.data = data;
    }else if( safe ){
            return;
    }else if( append ){
        if( typeof this.data !== "string" ){
            throw Error("Unsupported type. You're trying to append string data to non-string data");
        }else{
            this.data += data;
        }
    }else{
        this.data = data;
    }
    
    setType(this, type, "text/plain");
    setLength(this, length)

}