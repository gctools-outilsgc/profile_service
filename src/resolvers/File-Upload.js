const shortid = require('shortid');
const fs = require('fs');
const request = require('request');
const gm = require('gm');

const uploadDir = '/convert';
const fullUploadDir = __dirname + uploadDir;

const convertPicture = async ({ stream, filename }) => {
  const extension = "jpg";
  const id = shortid.generate()
  const destinationPath = `${fullUploadDir}/${filename}-${id}.${extension}`
  return new Promise((resolve, reject) =>
    gm(stream)
      .setFormat(`${extension}`)
      .resize(300,300)
      .write(destinationPath, error =>
        {
          if(error)
          {
            reject()
          }
          else{
            resolve( {path: destinationPath} )
          }
      })
  )
}

const postImage = ({path}) => {
   return new Promise((resolve, reject) => {
    var req = request({
      headers: {'Content-Type' : 'image/jpeg'},
      url:     `http://localhost:8007/backend.php`,
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

const createUploadFolderIfNeeded = ()=> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(fullUploadDir)){
      fs.mkdirSync(fullUploadDir);
    }
    resolve()
  });
}


const processUpload = async upload => {
  const { stream, filename } = await upload;
  await createUploadFolderIfNeeded()
  const { path } = await convertPicture({ stream, filename });
  const {url} = await postImage({path});
  return {url};
}

module.exports = {processUpload}