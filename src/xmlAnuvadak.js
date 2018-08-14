const { setType, setLength} = require("./util")
const j2xParser = require("fast-xml-parser").j2xParser;
const xmlParser = require("fast-xml-parser");

function XMLAnuvadak(options){
    const xmlWriter = getWriter(options);
    const xmlReadOptions = getReadOptions(options);

    this.writeXml = function (data, type, length, safe){

        if(data === null || data === undefined || typeof data !== "object" ){
            this.length(0);
            throw Error("Unsupported type. Given data can't be parsed to XML.");
        }else if(this.data && safe){
            return;
        }else{
            const anuvadakConfig = this._for.context.route.anuvadak;
    
            var parser;
            if(anuvadakConfig && anuvadakConfig.write && anuvadakConfig.write.xml){
                parser = anuvadakConfig.write.xml;
            }else{
                parser = xmlWriter;
            }
    
            this.data = parser.parse(data);
    
            setType(this, type, "text/xml");
            setLength(this, length)
        } 
    }

    this.readXml = async function(){
        const anuvadakConfig = this._for.context.route.anuvadak;
    
        var parsingOptions ;
        if(anuvadakConfig && anuvadakConfig.read && anuvadakConfig.read.xml){
            parsingOptions = anuvadakConfig.read.xml;
        }else{
            parsingOptions = xmlReadOptions;
        }
        
        await this.readBody();
        this.data = xmlParser.parse(data, parsingOptions);
        return this.data;
    }
}

function getWriter(options){
    if(options && options.write && options.write.xml){
        return new j2xParser(options.write.xml);
    }else{
        return new j2xParser();
    }
}

function getReadOptions(options){
    if(options && options.read && options.read.xml){
        return options.read.xml;
    }
}

module.exports = {
    XMLAnuvadak : XMLAnuvadak,
    getWriter : getWriter
}