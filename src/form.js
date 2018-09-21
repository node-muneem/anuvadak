// busboy is being used for POC and can be replaced with other library in future
// Formidable, Multer can be good alternatives

const FormHandler = require('./formHandler');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { isDirectoryExist} = require('./util');

const defaultOptions = {
    encoding : 'utf-8',
    file : {
        //keepFileInfo : false,
        uploadTo : os.tmpdir(),  //temp upload. Must be deleted if downloading is canceled, aborted, intruppted
        saveTo : "", // target folder
        keepExtensions : true,
        maxSize : 1024 * 1024, //1 MB
        hash : false,
        multiples : false, //when multiple files are being uploded
        on : {
            name : fileName => fileName,
            //This event is emmited only when targetDir is set and multiple files with the same name exist 
            duplicate : (field, file, filePath) => {
                //User can 
                // * decide to remove exisiting file and save new one.
                // * discard the new file
                // * error
                
                fs.unlink(path.join(filePath,file.name), (err) => {//remove duplicate
                    if (err) throw err;
                });
                throw Error(`Duplicate file: ${field} file can't be saved to ${filePath}with name ${file.name}.`);
            },
            //move event is emmited only when targetDir/saveTo is set and when the file has been moved or failed to move.
            move : () => {}, 
            
            //receive : () => {}, //receive event is not emmited if targetDir/saveTo is set.
            found : () => {}, //aka fileBegin. found event is emmited when a file field is found in request
        }
    },
    field : {
        maxSize : 200 * 1024, // 200 KB
        maxCount : 20,
        on : {
            //receive : () => {},
        },
    },
    on : {
        error : (err) => {
            throw Error(err);
        },
        end : () => {},
        aborted : () => {}
    }
}

function Form( globalOptionsInput ){
    const globalOptions = buildOptions(defaultOptions, globalOptionsInput);

    // files need to be uploaded in some temporary folder(file system) first to reduce RAM usages
    if( globalOptions.file.uploadTo && !isDirectoryExist(globalOptions.file.uploadTo) ){
        throw Error("Invalid upload folder to save input file.");
    }

     // Then it moves to target folder if it satisfies upload criterias. Otherwise gets deleted.
    if( globalOptions.file.saveTo && !isDirectoryExist(globalOptions.file.saveTo) ){
        throw Error("Invalid target folder to save input file.");
    }
    const formHandler = new FormHandler(globalOptions);
    
    this.readForm = async function(optionsInput){
        const options = buildOptions(globalOptions, optionsInput);//
        
        const form = formHandler.getInstance.bind(this)(options);
        form.on('fileBegin', options.file.on.found);
        this.body = {};
        form.on('field', (fieldName, value) => {
            if(!options.field.on.receive){
                this.body[fieldName] = value;
            }else{//user want to handle it
                options.field.on.receive(fieldName, value);
            }
        });
        form.on('file', (fieldName, file) => {
            if(options.file.on.receive){//if user want to handle it
                options.file.on.receive(fieldName, file);//let him handle
            }else{//otherwise move to user defined location
                this.body[fieldName] = file;
                let saveTo = options.file.saveTo ; //if present then move and rename file to given location
                if(!globalOptions.file.saveTo && !saveTo){
                    //do nothing
                }else{
                    if( !isDirectoryExist(saveTo) ){
                        saveTo = path.join(globalOptions.file.saveTo, saveTo);
                        if( isDirectoryExist(saveTo) ){
                            saveTo = "" ;
                        }
                    }
                    if(saveTo){
                        file.newPath = path.join(saveTo, file.name);
                        if( isExist(file.newPath) ){
                            options.file.on.duplicate(fieldName, file, saveTo );
                        }else{
                            fs.rename(file.path
                                , path.join(form.uploadDir, options.file.on.name(file.name) )
                                , options.file.on.move );
                        }
                    }else{//if user has defined the wrong location
                        options.on.error(new Error(`Invalid location to save file: ${saveTo}`));
                    }
                }
            }
            
        });

        await new Promise( (resolve, reject) => {
            form.read();
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

        return this.body;
    }
}

function buildOptions(globalOptions, options){
    if(!options) options = {};
    var optionsToBuild = {};
    optionsToBuild.encoding = options.encoding || globalOptions.encoding;
    if(options.file){
        optionsToBuild.file = {
            //keepFileInfo : options.file.keepFileInfo || globalOptions.file.keepFileInfo,
            uploadTo : options.file.uploadTo || globalOptions.file.uploadTo,
            saveTo : options.file.saveTo || globalOptions.file.saveTo , 
            keepExtensions : options.file.keepExtensions || globalOptions.file.keepExtensions ,
            maxSize : options.file.maxSize || globalOptions.file.maxSize , 
            hash : options.file.hash || globalOptions.file.hash ,
            multiples : options.file.multiples || globalOptions.file.multiples , 
        }
        if(options.file.on){
            optionsToBuild.file.on = {
                name : options.file.on.name || globalOptions.file.on.name,
                duplicate : options.file.on.duplicate || globalOptions.file.on.duplicate,
                move : options.file.on.move || globalOptions.file.on.move,
                receive : options.file.on.receive || globalOptions.file.on.receive,
                found : options.file.on.found || globalOptions.file.on.found,
            }
        }else{
            optionsToBuild.file.on = globalOptions.file.on;
        }
    }else{
        optionsToBuild.file = globalOptions.file;
    }
    if(options.field){
        optionsToBuild.field = {
            maxFieldsSize : options.field.maxFieldsSize || globalOptions.field.maxFieldsSize,
            maxFields : options.field.maxFields || globalOptions.field.maxFields , 
        }
        if(options.field.on){
            optionsToBuild.field.on = {
                receive : options.field.on.receive || globalOptions.field.on.receive,
            }
        }else{
            optionsToBuild.field.on = globalOptions.field.on;
        }
    }else{
        optionsToBuild.field = globalOptions.field;
    }

    if(options.on){
        optionsToBuild.on = {
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
    const formInstance = new Form(options);
    muneem.addToAsked("readForm", formInstance.readForm);
    const formHandler = new FormHandler(options);
    muneem.addToAsked("getFormHandler", formHandler.getInstance);
}

module.exports = config;