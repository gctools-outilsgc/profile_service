const processUpload = require("../File-Upload");

const throwExceptionIfProfileIsNotDefine = (profile) => {
    if (profile === null || typeof profile === "undefined"){
        throw new Error("Could not find profile with gcId ${args.gcId}");
    }
};

const processAvatar = (avatar) => {
    if (typeof avatar !== "undefined"){
        processUpload(avatar).then(({url}) => {
            return url;
        });
    }
};

module.exports ={
  processAvatar,
  throwExceptionIfProfileIsNotDefine
};