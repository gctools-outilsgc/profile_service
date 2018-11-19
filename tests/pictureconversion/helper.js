import gm from 'gm'
import fs from 'fs'
import path from 'path';
import * as shortid from 'shortid'

const im = gm.subClass({imageMagick: true})

function convertPicture(fileName, extension)
{
  const filePath = path.join(__dirname, `./pics/${fileName}`)
  const destinationDir =  path.join(__dirname, `/folder/`);
  createFolderIfNotExist(destinationDir);
    
  const newFilePath = path.join(destinationDir, `/${shortid.generate()}-${fileName}.${extension}`)
  
  const rs = fs.readFileSync(filePath);
  im(rs)
    .setFormat(extension)
    .stream()
    .pipe(fs.createWriteStream(newFilePath))
    .on('error', (error)=>{
      console.error(`error occured on conversion ${error}`)
    })

  return newFilePath;
}

function createFolderIfNotExist(folder){
  if (!fs.existsSync(folder)){
    fs.mkdirSync(folder);
  }
}

module.exports = {convertPicture}