const countries = require("countryjs");
const {validateRequiredField} = require("./objectHelper");

const throwExceptionIfProvinceDoesNotBelongToCountry = (country, province) =>{
  var states = countries.states(country);
  if(states && states.length > 0) {
      var upperCaseStates = states.map(function(x) {
                                          return x.toUpperCase();
                                      });
      var index = upperCaseStates.indexOf(province.toUpperCase());
      if(index === -1) {
          throw new Error("invalid province for selected country");
      }
  }
};

const getNewAddressFromArgs = (args) =>{
  if (typeof args.address === "undefined") {
      return null;
  }

  var errors = [
      validateRequiredField(args.address, "streetAddress"),
      validateRequiredField(args.address, "city"),
      validateRequiredField(args.address, "postalCode"),
      validateRequiredField(args.address, "country"),
      validateRequiredField(args.address, "province"),
  ];
  errors = errors.filter(function (el) {
      return el !== null && typeof el !== "undefined" && el !== "";
    });
  if (errors.length > 0) {
      throw new Error(errors);
  }

  var selectedCountry = args.address.country.value;
  args.address.country = selectedCountry;
  throwExceptionIfProvinceDoesNotBelongToCountry(selectedCountry, args.address.province);
  return args.address;
};

module.exports ={
  throwExceptionIfProvinceDoesNotBelongToCountry,
  getNewAddressFromArgs
};