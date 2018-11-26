const throwExceptionIfProfileIsNotDefine = (profile) => {
    if (profile === null || typeof profile === "undefined"){
        throw new Error("Could not find profile with gcId ${args.gcId}");
    }
};

module.exports ={
  throwExceptionIfProfileIsNotDefine
};