const helper = require("../../src/resolvers/helper/objectHelper");
const expect = require("chai").expect;


describe("copying a value", () =>{
  it("must be undefined when object does not exist", () =>{
    var value = helper.copyValueToObjectIfDefined();
    expect(value).to.be.undefined;
  });
  it("must be undefined when value is null", () =>{
    var value = helper.copyValueToObjectIfDefined(null);
    expect(value).to.be.undefined;
  });
  it("must be equal to original value if defined", () =>{
    var value = helper.copyValueToObjectIfDefined("value123456");
    expect(value).to.equal("value123456");
  });
});

describe("When validating property for object", () =>{
  const objectForTest={
    valid:"",
    invalidNull:null
  };
  it("must return message when field is undefined",() =>{
    var result = helper.validateRequiredField(objectForTest, "undefinedProperty");
    expect(result).to.contains("is not defined and is a required field");
  });
  it("must return message when field is NULL",() =>{
    var propertyName = "invalidNull";
    var result = helper.validateRequiredField(objectForTest, propertyName);
    expect(result).to.contains("is not defined and is a required field");
    expect(result).to.contains(propertyName);
  });
  it("must return no message when property exist", () =>{
    var propertyName = "valid";
    var result = helper.validateRequiredField(objectForTest, propertyName);
    expect(result).to.be.undefined;
  });
});