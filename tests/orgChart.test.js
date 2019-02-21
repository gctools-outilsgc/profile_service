const fs = require("fs");

const { makeExecutableSchema, addMockFunctionsToSchema }
  = require("graphql-tools");
const { graphql } = require("graphql");

const { getPrismaTestInstance } = require("./init/prismaTestInstance");

const Query = require("../src/resolvers/Query");
const mutations = require("../src/resolvers/Mutations");

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

const deleteProfiles = (profiles) => {
  const prisma = getPrismaTestInstance();
  const promises = [];
  profiles.forEach((profile) => {
    promises.push(new Promise((resolve) => {
      mutations.deleteProfile({}, { gcID: profile.gcID }, { prisma })
        .then(resolve)
        .catch((e) => {
          console.error(e);
          throw(e);
        });
    }));
  });
  return Promise.all(promises);
};

const createProfiles = (profiles) => {
  const prisma = getPrismaTestInstance();
  const promises = [];
  profiles.forEach((profile) => {
    promises.push(new Promise((resolve) => {
      mutations.createProfile({}, profile, { prisma }, "{gcID}")
        .then(resolve)
        .catch((e) => {
          console.error(e);
          throw(e);
        });
    }));
  });
  return Promise.all(promises);
};

const joinTeam = (profile, team) => {
  const prisma = getPrismaTestInstance();
  return new Promise((resolve) => {
      mutations.modifyProfile({}, {
        gcID: profile.gcID,
        data: {
          team: {
            id: team.id
          }
        }
      }, { prisma }, "{gcID}")
        .then(resolve)
        .catch((e) => {
          console.error(e);
          throw(e);
        });
    });
};

const deleteTeams = (teams) => {
  const prisma = getPrismaTestInstance();
  const promises = [];
  teams.forEach((team) => {
    promises.push(new Promise((resolve) => {
      prisma.mutation.deleteTeam({ where: { id: team.id } })
        .then(resolve)
        .catch((e) => {
          console.error(e);
          throw(e);
        });
    }));
  });
  return Promise.all(promises);
};

const createTeams = (teams) => {
  const prisma = getPrismaTestInstance();
  const promises = [];
  teams.forEach((team, idx) => {
    promises.push(new Promise((resolve) => {
      mutations.createTeam({}, team, { prisma }, "{id}")
        .then(({ id }) => {
          team.id = id;
          resolve([idx, id]);
        })
        .catch((e) => {
          console.error(e);
          throw(e);
        });
    }));
  });
  return Promise.all(promises);
};

const deleteOrganizations = (organizations) => {
  const prisma = getPrismaTestInstance();
  const promises = [];
  organizations.forEach((org) => {
    promises.push(new Promise((resolve) => {
      prisma.mutation
        .deleteOrganization({ where: { id: org.id } })
          .then(resolve)
          .catch((e) => {
            console.error(e);
            throw(e);
          });
    }));
  });
  return Promise.all(promises);
};

const createOrganizations = (organizations) => {
  const prisma = getPrismaTestInstance();
  const promises = [];
  organizations.forEach((org) => {
    promises.push(new Promise((resolve) => {
      mutations.createOrganization({}, org, { prisma }, "{id}")
        .then(resolve)
        .catch((e) => {
          console.error(e);
          throw(e);
        });
    }));
  });
  return Promise.all(promises);
};


describe("orgChart resolver", () => {
  describe("with no teams", () => {
    const profiles = [
      { gcID:"9283982", name: "Profile 1", email:"a3@mail.com" },
      { gcID:"9283983", name: "Profile 2", email:"s3@mail.com" },
    ];
    beforeAll((done) => {
      createProfiles(profiles).then(() => {
        done();
      });
    });
    it("should return error without gcIDa", async() => {
      const query = "query orgTest { orgchart { boxes { id } } }";
      const data = await graphql(schema, query);
      expect(data.errors).toBeDefined();
      const [{ message }] = data.errors;
      expect(message.indexOf("gcIDa")).toBeGreaterThanOrEqual(0);
      expect(data.errors).toMatchSnapshot();
    });
    it("should report no teams found", async() => {
      const query = "query orgTest { orgchart(gcIDa: \"1234\") { boxes { id } } }";
      const data = await graphql(schema, query);
      expect(data.errors).toBeDefined();
      const [{ message }] = data.errors;
      expect(message.indexOf("No teams")).toBeGreaterThanOrEqual(0);
      expect(data.errors).toMatchSnapshot();
    });
    afterAll((done) => {
      deleteProfiles(profiles).then(() => {
        done();
      });
    });
  });
  describe("with orphaned teams", () => {
    const prisma = getPrismaTestInstance();
    const profiles = [
      { gcID:"9283982", name: "Profile 1", email:"a@mail.com" },
      { gcID:"9283983", name: "Profile 2", email:"s@mail.com" },
    ];
    const org = { nameEn:"O", nameFr: "O", acronymEn: "OE", acronymFr: "OF" };
    const team1 = { nameEn: "T1", nameFr: "E1", organization: {}, owner: {} };
    const team2 = { nameEn: "T2", nameFr: "E2", organization: {}, owner: {} };
    beforeAll((done) => {
      createProfiles(profiles).then(() => {
        createOrganizations([org]).then(([{ id: orgId }]) => {
          team1.organization.id = orgId;
          team2.organization.id = orgId;
          team1.owner.gcID = profiles[0].gcID;
          team2.owner.gcID = profiles[1].gcID;
          createTeams([team1, team2]).then(() => {
            done();
          });
        });
      });
    });
    it("should report orphan status", async () => {
      const query = "query orgTest { orgchart(gcIDa: \"9283982\") { boxes { id } } }";
      const data = await graphql(schema, query);
      expect(data.errors).toBeDefined();
      const [{ message }] = data.errors;
      expect(message.indexOf("diverged")).toBeGreaterThanOrEqual(0);
      expect(data).toMatchSnapshot();
    });
    afterAll((done) => {
      deleteProfiles(profiles).then(() => {
        deleteTeams([team1, team2]).then(() => {
          deleteOrganizations([team1.organization]).then(() => {
            done();
          });
        });
      });
    });
  });

  describe("with structured teams with no root", () => {
    const prisma = getPrismaTestInstance();
    const profiles = [
      { gcID:"a", name: "Profile 1", email:"a1@mail.com" },
      { gcID:"b", name: "Profile 2", email:"b2@mail.com" },
      { gcID:"c", name: "Profile 3", email:"c3@mail.com" },
      { gcID:"d", name: "Profile 4", email:"d4@mail.com" },
      { gcID:"e", name: "Profile 5", email:"e5@mail.com" },
      { gcID:"f", name: "Profile 6", email:"f6@mail.com" },
    ];
    const org = { nameEn:"O", nameFr: "O", acronymEn: "OE", acronymFr: "OF" };
    const teams = [
      { nameEn: "T1", nameFr: "E1", organization: {}, owner: {} },
      { nameEn: "T2", nameFr: "E2", organization: {}, owner: {} },
      { nameEn: "T3", nameFr: "E3", organization: {}, owner: {} },
      { nameEn: "T4", nameFr: "E4", organization: {}, owner: {} },
      { nameEn: "T5", nameFr: "E5", organization: {}, owner: {} },
      { nameEn: "T6", nameFr: "E6", organization: {}, owner: {} },
    ];
    beforeAll((done) => {
      createProfiles(profiles).then(() => {
        createOrganizations([org]).then(([{ id: orgId }]) => {
          for (let x = 0; x < teams.length; x += 1) {
            const team = teams[x];
            team.organization.id = orgId;
            team.owner.gcID = profiles[x].gcID;
          }
          createTeams(teams).then((data) => {
            const promises = [];
            data.forEach(([x, id]) => {
              promises.push(joinTeam(profiles[x], { id }));
            });
            Promise.all(promises).then(() => {
              done();
            });
          });
        });
      });
    });
    it("should report lack of root", async () => {
      const query = "query orgTest { orgchart(gcIDa: \"a\") { boxes { id } } }";
      const data = await graphql(schema, query);
      expect(data.errors).toBeDefined();
      const [{ message }] = data.errors;
      expect(message.indexOf("determine root")).toBeGreaterThanOrEqual(0);
      expect(data).toMatchSnapshot();
    });
    afterAll((done) => {
      deleteTeams(teams).then(() => {
        deleteProfiles(profiles).then(() => {
          deleteOrganizations([teams[0].organization])
            .then(() => {
              done();
            }).catch((e) => {
              throw(e);
            });
        });
      });
    });
  });
  describe("with structured teams with valid root", () => {
    const prisma = getPrismaTestInstance();
    const profiles = [
      { gcID:"a", name: "Profile 1", email:"a1@mail.com" },
      { gcID:"b", name: "Profile 2", email:"b2@mail.com" },
      { gcID:"c", name: "Profile 3", email:"c3@mail.com" },
      { gcID:"d", name: "Profile 4", email:"d4@mail.com" },
      { gcID:"e", name: "Profile 5", email:"e5@mail.com" },
      { gcID:"f", name: "Profile 6", email:"f6@mail.com" },
    ];
    const org = { nameEn:"O", nameFr: "O", acronymEn: "OE", acronymFr: "OF" };
    const teams = [
      { nameEn: "T1", nameFr: "E1", organization: {}, owner: {} },
      { nameEn: "T2", nameFr: "E2", organization: {}, owner: {} },
      { nameEn: "T3", nameFr: "E3", organization: {}, owner: {} },
      { nameEn: "T4", nameFr: "E4", organization: {}, owner: {} },
      { nameEn: "T5", nameFr: "E5", organization: {}, owner: {} },
      { nameEn: "T6", nameFr: "E6", organization: {}, owner: {} },
    ];
    beforeAll((done) => {
      createProfiles(profiles).then(() => {
        createOrganizations([org]).then(([{ id: orgId }]) => {
          for (let x = 0; x < teams.length; x += 1) {
            const team = teams[x];
            team.organization.id = orgId;
            team.owner.gcID = profiles[x].gcID;
          }
          createTeams(teams).then((data) => {
            const promises = [];
            data.forEach(([x, id]) => {
              if (x > 0) {
                promises.push(joinTeam(profiles[x - 1], { id }));
              }
            });
            Promise.all(promises).then(() => {
              done();
            });
          });
        });
      });
    });
    it("should return lines and boxes", async () => {
      const query = "query orgTest { orgchart(gcIDa: \"a\") { boxes { id } lines { id } } }";
      const data = await graphql(schema, query);
      expect(data.errors).not.toBeDefined();
      expect(data.data).toBeDefined();
      expect(data.data.orgchart).toBeDefined();
      const { data: { orgchart } } = data;
      expect(orgchart.lines).toBeDefined();
      expect(orgchart.boxes).toBeDefined();
      expect(data).toMatchSnapshot();
    });
    afterAll((done) => {
      deleteTeams(teams).then(() => {
        deleteProfiles(profiles).then(() => {
          deleteOrganizations([teams[0].organization])
            .then(() => {
              done();
            }).catch((e) => {
              throw(e);
            });
        });
      });
    });
  });
});