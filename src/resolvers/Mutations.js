function createProfile(_, args, context, info){
    return context.prisma.mutation.createProfile({
        data:{
            
        }
    })
}

module.exports = {
    createProfile,
}