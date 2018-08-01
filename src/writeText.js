

/**
 * Write text data if it is not written before. Content type will not be set if it is already set
 * @param {*} data : content
 * @param {string} type : content-type
 * @param {number} length : content-length
 * @param {boolean} append : append content if already present
 */
module.exports = function(data, type, length, safe, append){
    if(! (safe && this.data) || append ) { 
        if(data === null || data === undefined ){
            data = "";
            //logger.log.warn("You're not setting the correct data. I hope you know what're you doing");
        }else if( typeof data === "number"){
            data += '';
        }else if( typeof data === "string"){
            //do nothing
        }else{
            this.length(0);
            //this.end(null,406,"Unsupported type " + typeof data + " is given");
            throw Error("Unsupported type. You're trying to set non-text data");
        }

        if(append && this.data && typeof this.data === 'string'){
            this.data += data;   
        }else{
            this.data = data;   
        }
        

        if(!this.type() ){
            if(type){
                this.type(type);
            }else{
                this.type("text/plain");
            }
        }

        if(length){
            this.length(length);
        }else{
            this.length(this.data.length);
        }
    } 
}