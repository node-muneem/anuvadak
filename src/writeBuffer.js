/**
 * Write Buffer data if it is not written before
 * @param {*} data : content
 * @param {string} type : content-type
 * @param {number|string} length : content-length
 */
module.exports = function(data,type,length, safe){
    if(! (safe && this.data)  ) { 
        if(data === null || data === undefined || !Buffer.isBuffer(data)){
            this.length(0);
            //this.end(null,406,"Unsupported type " + typeof data + " is given");
            throw Error("Unsupported type. You're trying to set non-buffer data");
        }

        this.data = data;   

        if(!this.type() ){
            if(type){
                this.type(type);
            }else{
                this.type("application/octet-stream");
            }
        }

        if(length){
            this.length(length);
        }else{
            this.length( Buffer.byteLength(this.data) );
        }
    } 
}