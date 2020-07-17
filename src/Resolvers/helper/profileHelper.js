const {propertyExists} = require("./objectHelper");
const { UserInputError } = require("apollo-server");

const throwExceptionIfProfileIsNotDefined = (profile) => {
    if (profile === null || typeof profile === "undefined"){
        throw new UserInputError("E1ProfileNotExist");
    }
};

const throwExceptionIfTeamIsNotDefined = (team) => {
  if (team === null || typeof team === "undefined" || team.length === 0){
      throw new UserInputError("E2TeamNotExist");
  }
};

async function getTeams(userID, context){
  const result = await context.prisma.query.profile({where:{gcID: userID}}, "{ownerOfTeams{id,nameEn, members{gcID}}}");
  return result;
}

// Recursive function to cascade and move organizations
async function changeTeamOrg(teams, context, newOrgID){

  if (teams.ownerOfTeams.length > 0){
    Promise.all(teams.ownerOfTeams.map(async (team) => {
      await context.prisma.mutation.updateTeam(
        {
          where: {
            id: team.id
          },
          data: {
            organization:{
              connect:{
                id: newOrgID.organization.id
             }
            }
          }
        });

      if (team.members.length > 0){
        Promise.all(team.members.map(async (member) => {
          const childTeams = await getTeams(member.gcID, context);
          if (typeof childTeams !== "undefined" && childTeams !== null){
            await changeTeamOrg(childTeams, context, newOrgID);
          }
        }));    
      }
    }));
  }
  return;
}

async function changeOwnedTeamsRoot(userID, newTeamID, context){
  const newOrgID = await context.prisma.query.team({where:{id: newTeamID}}, "{organization{id}}");
  const oldOrgID = await context.prisma.query.profile({where:{gcID: userID}}, "{team{organization{id}}}");
  


  if (oldOrgID.team !== null){
    if (newOrgID.organization.id === oldOrgID.team.organization.id){
      return;
    }
  }

  
  const teams = await getTeams(userID, context);
  await changeTeamOrg(teams, context, newOrgID);
  return;
  
}

async function moveMembersToDefaultTeam(teamID, context){

  //TODO: Add error handling to send errors to MQ
  
  const teamInfo = await context.prisma.query.team({where:{id: teamID}},"{members { gcID }, owner{gcID}}");
  const defaultTeam = await context.prisma.query.teams({where:{owner:{gcID: teamInfo.owner.gcID}, nameEn: "Default Team"}}, "{id}");
  // TODO: Batch into a single call instead of multiple.
  if (typeof defaultTeam[0] !== "undefined" && defaultTeam[0] !== null){
    for (let x = 0; x < teamInfo.members.length; x++){
      await context.prisma.mutation.updateTeam({where:{id: defaultTeam[0].id}, data:{members:{connect:{gcID: teamInfo.members[x].gcID}}}});
    }

  }

  

}

module.exports ={
  throwExceptionIfProfileIsNotDefined,
  throwExceptionIfTeamIsNotDefined,
  changeOwnedTeamsRoot,
  moveMembersToDefaultTeam
};
