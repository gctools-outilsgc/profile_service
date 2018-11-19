import {convertPicture} from './helper'

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