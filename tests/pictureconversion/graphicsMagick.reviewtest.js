import {readFileSync,createWriteStream} from 'fs'
import path from 'path';
import gm from 'gm'
import * as shortid from 'shortid'

const im = gm.subClass({imageMagick: true})

describe('Convert any picture to JPG format', () =>{
  it('must convert JPG',()=>{
    convertPicture('avatar.jpg', 'jpg')
  }),
  it('must convert PNG',()=>{
    convertPicture('avatar.png', 'jpg')
  }),
  it('must convert GIF',()=>{
    convertPicture('avatar.gif', 'jpg')
  })
})

function convertPicture(fileName, extension)
{
  const filePath = path.join(__dirname, `./pics/${fileName}`)
  console.log(path.join(__dirname, `/converted/${shortid.generate()}-${fileName}.${extension}`))
  const newFilePath = path.join(__dirname, `/converted/${shortid.generate()}-${fileName}.${extension}`)
  const rs = readFileSync(filePath);
  im(rs)
    .setFormat(extension)
    .stream()
    .pipe(createWriteStream(newFilePath))
    .on('error', (error)=>{
      console.error(`error occured on conversion ${error}`)
    })
}