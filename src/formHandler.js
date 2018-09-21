// busboy is being used for POC and can be replaced with other library in future
// Formidable, Multer can be good alternatives
const formidable = require('formidable');
const os = require('os');
const path = require('path');
const { isDirectoryExist} = require('./util');

const defaultOptions = {
    encoding : 'utf-8',
    file : {
        //keepFileInfo : false,
        uploadTo : os.tmpdir(),  //temp upload. Must be deleted if downloading is canceled, aborted, intruppted
        keepExtensions : true,
        maxSize : 1024 * 1024, //1 MB
        hash : false,
        multiples : false, //when multiple files are being uploded
    },
    field : {
        maxSize : 200 * 1024, // 200 KB
        maxCount : 20,
    }
}

function FormHandler( globalOptionsInput ){
    const globalOptions = buildOptions(defaultOptions, globalOptionsInput);

    // files need to be uploaded in some temporary folder(file system) first to reduce RAM usages
    if( globalOptions.file.uploadTo && !isDirectoryExist(globalOptions.file.uploadTo) ){
        throw Error("Invalid upload folder to save input file.");
    }

     // Then it moves to target folder if it satisfies upload criterias. Otherwise gets deleted.
    if( globalOptions.file.saveTo && !isDirectoryExist(globalOptions.file.saveTo) ){
        throw Error("Invalid target folder to save input file.");
    }

    this.getInstance = function(optionsInput){
        const options = buildOptions(globalOptions, optionsInput);//
        
        //Either absolute or relative to uploadTo set in global options
        let uploadTo = options.file.uploadTo ; 
        if( !isDirectoryExist(uploadTo) ){
            uploadTo = path.join(globalOptions.file.uploadTo, uploadTo);
            if( !isDirectoryExist(uploadTo) ){
                throw Error("Invalid upload directory to save input file:" + uploadTo);
            }
        }
        
        const form = new formidable.IncomingForm();
        form.uploadTo = uploadTo;
        form.keepExtensions = options.file.keepExtensions;
        form.type = "multipart" ;
        form.maxFieldsSize = options.field.maxSize;
        form.maxFileSize = options.file.maxSize;
        form.maxFields = options.field.maxCount;
        //Calculate checksum using sha1' or 'md5'. Use it later to verify. 
        //Tip: May slowdown your application for big files. So check the size and then calculate it. Or delegate.
        form.hash = options.file.hash; 
        //form.multiples = options.file.multiples;
        form.read = () => {
            form.parse(this.stream);
        }
        
        return form;
    }
}

function buildOptions(globalOptions, options){
    if(!options) options = {};
    var optionsToBuild = {};
    optionsToBuild.encoding = options.encoding || globalOptions.encoding;
    if(options.file){
        optionsToBuild.file = {
            uploadTo : options.file.uploadTo || globalOptions.file.uploadTo,
            keepExtensions : options.file.keepExtensions || globalOptions.file.keepExtensions ,
            maxSize : options.file.maxSize || globalOptions.file.maxSize , 
            hash : options.file.hash || globalOptions.file.hash ,
            multiples : options.file.multiples || globalOptions.file.multiples , 
        }
    }else{
        optionsToBuild.file = globalOptions.file;
    }
    if(options.field){
        optionsToBuild.field = {
            maxFieldsSize : options.field.maxFieldsSize || globalOptions.field.maxFieldsSize,
            maxFields : options.field.maxFields || globalOptions.field.maxFields , 
        }
    }else{
        optionsToBuild.field = globalOptions.field;
    }

    return optionsToBuild;
}


module.exports = FormHandler;
