
async function generateOnlineTemplate(template, to, from){

    const onlineTemplate = {
        Team:{
            submitter:{
                titleEn: "Approval Submission Sucessful" ,
                titleFr: "Soumission de l'approbation réussie" ,
                descriptionEn: `Your request to identify ${to.name}'s as your supervisor has been created` ,
                descriptionFr: `Votre demande d'identifié ${to.name} comme votre superviseur a été créée`,
                actionLevel: "NoUserAction",
            },
            approver:{
                titleEn: `Request from ${from.name}` ,
                titleFr: `Demande de ${from.name}`,
                descriptionEn: `${from.name} has identified you as their supervisor.  Please approve or deny this request`,
                descriptionFr: `${from.name} vous a identifié comme leur superviseur. Veuillez svp approuver ou refuser cette demande`,
                actionLevel: "UserActionRequired",
            }

        },
        Informational:{
            submitter:{
                titleEn: ,
                titleFr: ,
                descriptionEn: ,
                descriptionFr: ,
                actionLevel: "NoUserAction",
            },
            approver:{
                titleEn: ,
                titleFr: ,
                descriptionEn: ,
                descriptionFr: ,
                actionLevel: "UserActionRequired",
            }

        },
        Membership:{
            submitter:{
                titleEn: ,
                titleFr: ,
                descriptionEn: ,
                descriptionFr: ,
                actionLevel: "NoUserAction",
            },
            approver:{
                titleEn: ,
                titleFr: ,
                descriptionEn: ,
                descriptionFr: ,
                actionLevel: "UserActionRequired",
            }
        }  
    };

}