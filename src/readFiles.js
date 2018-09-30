// busboy is being used for POC and can be replaced with other library in future
// Formidable, Multer can be good alternatives
const formidable = require('formidable');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { isDirectoryExist} = require('./util');

const defaultOptions = {
    encoding : 'utf-8',
    sync : false,
    uploadTo : os.tmpdir(),  //temp upload. Must be deleted if downloading is canceled, aborted, intruppted
    saveTo : "", // target folder
    keepExtensions : true,
    maxSize : 1024 * 1024, //1 MB
    hash : false,
    //multiples : false, //when multiple files are being uploded
    on : {
        name : fileName => fileName,
        //This event is emmited only when targetDir is set and multiple files with the same name exist 
        duplicate : (field, file, filePath) => {
            
            fs.unlink(path.join(filePath,file.name), (err) => {//remove duplicate
                if (err) throw err;
            });
            throw Error(`Duplicate file: ${field} file can't be saved to ${filePath}with name ${file.name}.`);
        },
        //move event is emmited only when targetDir/saveTo is set and when the file has been moved or failed to move.
        move : () => {}, 
        
        //receive : () => {}, //receive event is not emmited if targetDir/saveTo is set.
        found : () => {}, //aka fileBegin. found event is emmited when a file field is found in request
        error : (err) => {
            throw Error(err);
        },
        end : () => {},
        aborted : () => {}
    }
}

function Files( globalOptions ){
    globalOptions = buildOptions(defaultOptions, globalOptions);
    // files need to be uploaded in some temporary folder(file system) first to reduce RAM usages
    if( globalOptions.uploadTo && !isDirectoryExist(globalOptions.uploadTo) ){
        throw Error("Invalid upload folder to save input file.");
    }
    
    // Then it moves to target folder if it satisfies upload criterias. Otherwise gets deleted.
    if( globalOptions.saveTo && !isDirectoryExist(globalOptions.saveTo) ){
        throw Error("Invalid target folder to save input file.");
    }
    

    this.readForm = async function(options){
        options = buildOptions(globalOptions, options);//
        
        //Either absolute or relative to uploadTo set in global options
        let uploadTo = options.uploadTo ; 
        if( !isDirectoryExist(uploadTo) ){
            uploadTo = path.join(globalOptions.uploadTo, uploadTo);
            if( !isDirectoryExist(uploadTo) ){
                throw Error("Invalid upload directory to save input file:" + uploadTo);
            }
        }
        
        const form = new formidable.IncomingForm();
        form.uploadDir = uploadTo;
        form.keepExtensions = options.keepExtensions;
        form.type = "multipart" ;
        //form.maxFieldsSize = options.field.maxSize;
        form.maxFileSize = options.maxSize;
        //form.maxFields = 0;
        //Calculate checksum using sha1' or 'md5'. Use it later to verify. 
        //Tip: May slowdown your application for big files. So check the size and then calculate it. Or delegate.
        form.hash = options.hash; 
        //form.multiples = options.multiples; 
        form.on('fileBegin', options.on.found);
        
        this.body = {};
        
        form.on('file', (fieldName, file) => {
            
            if(options.on.receive){//if user want to handle it
                options.on.receive(fieldName, file);//let him handle
            }else{//otherwise move to user defined location
                this.body[fieldName] = file;
                let saveTo = options.saveTo ; //if present then move and rename file to given location
                if(!globalOptions.saveTo && !saveTo){
                    //do nothing
                }else{
                    if( !isDirectoryExist(saveTo) ){
                        saveTo = path.join(globalOptions.saveTo, saveTo);
                        if( isDirectoryExist(saveTo) ){
                            saveTo = "" ;
                        }
                    }
                    if(saveTo){
                        file.newPath = path.join(saveTo, file.name);
                        if( isExist(file.newPath) ){
                            options.on.duplicate(fieldName, file, saveTo );
                        }else{
                            fs.rename(file.path
                                , path.join(uploadTo, options.on.name(file.name) )
                                , options.on.move );
                        }
                    }else{//if user has defined the wrong location
                        options.on.error(new Error(`Invalid location to save file: ${saveTo}`));
                    }
                }
            }
            
        });

        if(options.sync){
            await new Promise( (resolve, reject) => {
                form.parse(this.stream);
                form.on('error', (err) => {
                    reject(err);
                    options.on.error(err);
                });
                form.on('aborted', () => {
                    reject();
                    options.on.aborted();
                });
                form.on('end', () => {
                    resolve(this.body);
                    options.on.end();
                });
            });
        }else{
            form.on('error', options.on.error);
            form.on('aborted', options.on.aborted);
            form.on('end', options.on.end);
            form.parse(this.stream);
        }
        return this.body;
    }
}

function buildOptions(globalOptions, options){
    if(!options) options = {};
    var optionsToBuild = {
        encoding : options.encoding || globalOptions.encoding,
        sync : options.sync || globalOptions.sync,
        uploadTo : options.uploadTo || globalOptions.uploadTo,
        saveTo : options.saveTo || globalOptions.saveTo , 
        keepExtensions : options.keepExtensions || globalOptions.keepExtensions ,
        maxSize : options.maxSize || globalOptions.maxSize , 
        hash : options.hash || globalOptions.hash ,
        multiples : options.multiples || globalOptions.multiples , 
    }
    
    if(options.on){
        optionsToBuild.on = {
            name : options.on.name || globalOptions.on.name,
            duplicate : options.on.duplicate || globalOptions.on.duplicate,
            move : options.on.move || globalOptions.on.move,
            receive : options.on.receive || globalOptions.on.receive,
            found : options.on.found || globalOptions.on.found,
            error : options.on.error || globalOptions.on.error,
            end : options.on.end || globalOptions.on.end,
            aborted : options.on.aborted || globalOptions.on.aborted,
        }
    }else{
        optionsToBuild.on = globalOptions.on;
    }
    return optionsToBuild;
}

function config(muneem, options){
    const formInstance = new Files(options);
    muneem.addToAsked("readFiles", formInstance.readForm);
}

module.exports = config;