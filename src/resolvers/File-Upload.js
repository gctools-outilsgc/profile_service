const shortid = require("shortid");
const fs = require("fs");
const request = require("request");
const sharp = require("sharp");

const uploadDir = '/convert';
const fullUploadDir = __dirname + uploadDir;

const convertPicture = async ({ stream, filename }) => {
  const id = shortid.generate();
  const destinationPath = `${fullUploadDir}/${filename}-${id}.jpg`;

  return new Promise((resolve, reject) => {
   
    sharp(stream).resize(300).jpeg()
    .toFile(destinationPath)
    .then(() => resolve( {path: destinationPath} ))
    .catch((errors) => reject(errors));
  });
};

const postImage = ({path}) => {
   return new Promise((resolve, reject) => {
    var req = request({
      headers: {"Content-Type" : "image/jpeg"},
      url:     "http://localhost:8007/backend.php",
      method: "POST"
    }, function optionalCallback (err, httpResponse, body) {
      if (err) {
        reject();
      }
      else{
        var bodyJson = JSON.parse(body)
        var url = bodyJson.url;
        resolve({url});
      }
    });
    var form = req.form();
    form.append('postimage', fs.createReadStream(path))
   });
};

const createUploadFolderIfNeeded = async () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(fullUploadDir)){
      fs.mkdirSync(fullUploadDir);
    }
    resolve()
  });
}

const deletePictureFromTempFolder = async ({path})=> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path), err => reject(err)){
      fs.unlinkSync(path, (err)=>reject(err))
    }
    resolve()
  });
}

const processUpload = async upload => {
  const { stream, filename } = await upload;
  await createUploadFolderIfNeeded()
  const { path } = await convertPicture({ stream, filename });
  const {url} = await postImage({path});
  await deletePictureFromTempFolder({path});
  return {url, path};
}

module.exports = {processUpload}