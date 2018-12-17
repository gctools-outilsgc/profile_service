const throwExceptionIfTeamIsNotDefined = (Team) => {
    if (Team === null || typeof Team === "undefined"){
        throw new Error("Could not find organization with id ${args.id}");
    }
};

module.exports ={
  throwExceptionIfTeamIsNotDefined
};