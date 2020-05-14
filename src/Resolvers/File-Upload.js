const shortid = require("shortid");
const fs = require("fs");
const request = require("request");
const sharp = require("sharp");
const uploadDir = "./temp_convert";
const config = require("../config");

const storeUpload = async ({ stream, filename }) => {
  const id = shortid.generate();
  const path = `${uploadDir}/${id}-${filename}`;

  return new Promise((resolve, reject) =>
    stream
      .pipe(fs.createWriteStream(path))
      .on("finish", () => resolve(path))
      .on("error", reject),
  );
};

function deletePictureFromTempFolder(path) {
  return new Promise((resolve, reject) => {
    var deletePath = String(path);
    if (fs.existsSync(deletePath, (err) => reject(err))) {
      fs.unlinkSync(deletePath, (err) => reject(err));
    }
    resolve();
  });
}

const convertPicture = async (originPath) => {
  var destinationPath = `${originPath}.jpg`;
  // uploadPath = String(originPath);

  return new Promise((resolve, reject) => {
    sharp(originPath)
      .jpeg()
      .resize(config.image.size)
      .toFile(destinationPath)
      .then(function (removeFile) {
        deletePictureFromTempFolder(originPath);
      })
      .then(function (err, info) {
        if (err) {
          reject(err);
        } else {
          resolve(destinationPath);
        }
      });
  });
};

const deleteOldAvatar = async (profile) => {
  return new Promise((resolve, reject) => {
    if (profile != null && profile.avatar != "") {
      var avatarPath = profile.avatar.split('/');
      var avatarHash = avatarPath[avatarPath.length - 1];
      request.post(`${config.image.url}/delete_${config.image.code}/${avatarHash}`);
    }
    resolve();
  });
};

const postImage = (path) => {
  return new Promise((resolve, reject) => {
    var filePath = String(path);
    var req = request({
      headers: { "Content-Type": "image/jpeg" },
      url: config.image.url + "/api/upload.php",
      method: "POST"
    }, function optionalCallback(err, httpResponse, body) {
      if (err) {
        reject();
      } else {
        var bodyJson = JSON.parse(body);
        if (bodyJson.status == "err") {
          reject();
        }
        var url = bodyJson.url;
        resolve(url);
      }
    });
    var form = req.form();
    form.append("file", fs.createReadStream(filePath));
  });
};

const createUploadFolderIfNeeded = async () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    resolve();
  });
};

const processUpload = async (upload, profile) => {
  const { createReadStream, filename } = await upload;
  const stream = createReadStream();
  await createUploadFolderIfNeeded();
  const originPath = await storeUpload({ stream, filename });
  const avatarPath = await convertPicture(originPath);
  const url = await postImage(avatarPath);
  await deletePictureFromTempFolder(avatarPath);
  await deleteOldAvatar(profile);
  return url;
};

module.exports = { processUpload };