import fs from "fs";
import path from "path";
import * as shortid from "shortid";
import sharp from "sharp";

function createFolderIfNotExist(folder){
  if (!fs.existsSync(folder)){
    fs.mkdirSync(folder);
  }
}

function convertPictureToJpeg(fileName){
  const filePath = path.join(__dirname, `./pics/${fileName}`);
  const destinationDir =  path.join(__dirname, "/sharpConvert/");
  createFolderIfNotExist(destinationDir);
    
  const newFilePath = path.join(destinationDir, `/${shortid.generate()}-${fileName}.jpg`);
  
  sharp(filePath)
    .resize(300)      
    .jpeg()
    .toFile(newFilePath);

  return newFilePath;
}

module.exports = {convertPictureToJpeg, createFolderIfNotExist};