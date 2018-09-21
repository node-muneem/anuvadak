const fs = require("fs");

function setLength(answer, length, newLength){
    if(newLength === undefined){
        newLength = answer.data.length;
    }
    if(length){
        answer.length(length);
    }else{
        answer.length( newLength );
    }
}

function setType(answer, type, defaultType){
    if(!answer.type() ){
        if(type){
            answer.type(type);
        }else{
            answer.type(defaultType);
        }
    }
}

function fileExist(filepath){
    return fs.existsSync(filepath) && fs.lstatSync(filepath).isFile();
}

function isDirectoryExist(filepath){
    return fs.existsSync(filepath) && fs.lstatSync(filepath).isDirectory();
}

module.exports = {
    setType : setType, 
    setLength : setLength,
    fileExist : fileExist,
    isDirectoryExist : isDirectoryExist
}