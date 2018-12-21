const {validateRequiredField} = require("./objectHelper");

const throwExceptionIfTeamIsNotDefined = (Team) => {
    if (Team === null || typeof Team === "undefined"){
        throw new Error("Could not find organization with id ${args.id}");
    }
};
const getTeamFromArgs = (args) => {
    if (typeof args.team === "undefined") {
        return null;
    }

    var errors = [
    validateRequiredField(args.team, "id")
    ];

    errors = errors.filter(function (el) {
        return el !== null && typeof el !== "undefined" && el !== "";
      });

    if (errors.length > 0) {
        throw new Error(errors);
    }
  
      return args.team;
};

module.exports ={
  throwExceptionIfTeamIsNotDefined,
  getTeamFromArgs
};