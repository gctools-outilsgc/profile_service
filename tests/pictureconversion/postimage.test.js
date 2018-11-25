const {processUpload} = require("../../src/resolvers/File-Upload");
const fs = require("fs");
const path = require("path");

describe("upload and convert image", async () => {
  it("must return the image url after",() => {
    var filepath = path.join(__dirname, "./pics/avatar.gif");
    var stream = fs.readFileSync(filepath);
    processUpload({stream, filename:"test"})
    .then(({url}) => {
      expect(url).toContain("https://avatar");
      console.log(`Url for picture upload : ${url}`);
    })
    .catch((result) => {
      if(result)
        console.error(`Error ------ ${result}`);
    });
  });
  it("must delete picture in temp folder after upload", async () => {
    var filepath = path.join(__dirname, "./pics/avatar.png");
    var stream = fs.readFileSync(filepath);
    processUpload({stream, filename:"test"})
    .then(({path}) => {
      expect(fs.existsSync(path)).toBeFalsy();
    })
    .catch((result) => {
      if(result)
        console.error(`Error ------ ${result}`);
    });
  });
});