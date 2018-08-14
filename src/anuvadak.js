const writeText = require("./writeText");
const writeStream = require("./writeStream");
const writeBuffer = require("./writeBuffer");
const {writeJson, readJson} = require("./jsonAnuvadak");
const { XMLAnuvadak, getWriter } = require("./xmlAnuvadak");

module.exports = (muneem, options) => {
    options = options || {};
    var xmlAnuvadak = new XMLAnuvadak(options);

    muneem.addToAnswer("writeText", writeText);
    muneem.addToAnswer("writeStream", writeStream);
    muneem.addToAnswer("writeBuffer", writeBuffer);
    muneem.addToAnswer("writeJson", writeJson);
    muneem.addToAnswer("writeXml", xmlAnuvadak.writeXml);
    //muneem.addToAnswer("writeNimn", nimnAnuvadak.writeNimn);

    muneem.addToAsked("readJson", readJson);
    muneem.addToAsked("readXml", xmlAnuvadak.readXml);

    //add a router event
    muneem.on("addRoute", buildConfiguration);
}

function buildConfiguration( routeContext ){
    if(routeContext.anuvadak) {
        if(routeContext.anuvadak.write){//write to response
            
            var xmlWriteConfig = routeContext.anuvadak.write.xml;
            if( xmlWriteConfig ){
                routeContext.anuvadak.write.xml = getWriter( xmlWriteConfig );
            }

        }else if(routeContext.anuvadak.read){//read from request
            
        }
    }
}