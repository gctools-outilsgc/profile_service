const throwExceptionIfOrgIsNotDefined = (orgTier) => {
    if (orgTier === null || typeof orgTier === "undefined"){
        throw new Error("Could not find organization with id ${args.id}");
    }
};

module.exports ={
  throwExceptionIfOrgIsNotDefined
};