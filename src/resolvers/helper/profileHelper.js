const throwExceptionIfProfileIsNotDefined = (profile) => {
    if (profile === null || typeof profile === "undefined"){
        throw new Error("Could not find profile with gcID ${args.gcID}");
    }
};

module.exports ={
  throwExceptionIfProfileIsNotDefined
};