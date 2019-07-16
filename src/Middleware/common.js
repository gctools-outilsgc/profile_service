const { removeNullKeys, copyValueToObjectIfDefined } = require("../resolvers/helper/objectHelper");

async function getProfile(context, args){
    return await context.prisma.query.profile({
        where:{
            gcID: args.gcID
        }
    },"{gcID, name, email, avatar, mobilePhone, officePhone, titleEn, titleFr, address{streetAddress, city, province, postalCode, country},team{id,organization{id},owner{gcID}}}");
}

async function getTeam(context, id){
    return await context.prisma.query.team({
         where:{
             id
         }
     }, "{id, owner{gcID}}");
 }

function checkForDirective(field, info, directiveName){
    const fieldDirectives = info.returnType.ofType._fields[field].astNode.directives;
    var directiveExists = false;
    if (fieldDirectives.length > 0){
        fieldDirectives.forEach((directive) => {
            if (directive.name.value === directiveName){
                directiveExists = true;
                return;
            }
        });
    }
    return directiveExists;
}

function checkForEmptyChanges(changesObject){
    // Return True if requestedChanges is all null

    var requestedChanges = JSON.parse(JSON.stringify(changesObject));
    var isNull = true;
    
    Object.entries(requestedChanges).forEach((field) => {
        isNull = isNull && !field;
    });

    return isNull;
}

async function getExistingApprovals(context, gcID, team = null){
    return await context.prisma.query.approvals({
        where: removeNullKeys({
            status: "Pending",
            gcIDSubmitter:{
                gcID
            },
            requestedChange:{
                ownershipOfTeam:{
                    id: copyValueToObjectIfDefined(team ? team.id : null)
                }
            }
        })
    }, 
    `{
        id,
        gcIDApprover{
            gcID
        },
        status,
        changeType,
        requestedChange{
            id,
            name,
            email,
            avatar,
            mobilePhone,
            officePhone,
            address{
            streetAddress,
            city,
            province,
            postalCode,
            country
            },
            titleEn,
            titleFr,
            team{
                id
            },
            ownershipOfTeam{
                id
            } 
        }
    }`);
}

async function getApprovalType(approvals, type){

    if(approvals){
        const index = approvals.findIndex((approval) => {
            return approval.changeType === type;
        });
    
        if (index >= 0){
            return approvals[index];
        }
    }

    return null;
}

module.exports = {
    getProfile,
    getTeam,
    checkForDirective,
    checkForEmptyChanges,
    getApprovalType,
    getExistingApprovals
};