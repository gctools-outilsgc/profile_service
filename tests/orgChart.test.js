const fs = require("fs");

const { makeExecutableSchema, addMockFunctionsToSchema }
  = require("graphql-tools");
const { graphql } = require("graphql");

const { getPrismaTestInstance } = require("./init/prismaTestInstance");
const Query = require("../src/resolvers/Query");

const typeDefs = fs.readFileSync("src/schema.graphql", "utf8");
const schema = makeExecutableSchema({ typeDefs });

const mocks = {
  Query: () => ({
    orgchart: (a, b, c, d) => {
      return Query.orgchart(a, b, Object.assign({}, c, { prisma: getPrismaTestInstance()}), d);
    }
  })
};

addMockFunctionsToSchema({ schema, mocks });

describe("orgChart Query", () => {
  it("should return error without gcIDa", async () => {
    const query = "query orgTest { orgchart { boxes { id } } }";
    const data = await graphql(schema, query);
    expect(data.errors).toBeDefined();
    expect(data.errors).toMatchSnapshot();
  });
  it("should report no teams found", async () => {
    const query = "query orgTest { orgchart(gcIDa: \"1234\") { boxes { id } } }";
    const data = await graphql(schema, query);
    expect(data.errors).toBeDefined();
    expect(data.errors).toMatchSnapshot();
  });

});
