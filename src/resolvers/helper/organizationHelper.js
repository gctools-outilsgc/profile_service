const throwExceptionIfOrganizationIsNotDefined = (organization) => {
    if (organization === null || typeof organization === "undefined"){
        throw new Error("Could not find organization with id ${args.id}");
    }
};

module.exports ={
  throwExceptionIfOrganizationIsNotDefined
};