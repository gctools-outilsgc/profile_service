function createAddress(_, args, context, info)
{
    return context.mutation.createAddress({data: args}, info)
}

module.exports = { createAddress }