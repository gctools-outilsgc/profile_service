const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const {convertPictureToJpeg} = require("./helper");

describe("Convert picture using sharp", () => {
  it("must convert PNG to JPG", () => {
    convertPictureToJpeg("avatar.png");
  });
  it("must convert stream to JPG", () => {
    const filePath = path.join(__dirname, "./pics/avatar.png");
    const destinationPath = path.join(__dirname, "./sharpConvert");
    
    const rs = fs.createReadStream(filePath);
    const ws = fs.createWriteStream(`${destinationPath}/converted.jpg`);
    const pipeline = sharp().resize(300).jpeg().pipe(ws);

    rs.pipe(pipeline);
  });
});

