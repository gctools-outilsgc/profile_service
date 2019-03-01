const mutations = require("../src/resolvers/Mutations");
const { getContext, cleanUp } = require("./init/helper");

const parent = {};
var ctx = {};

beforeAll(async (done) => {
    ctx = await getContext();
    done();
});

afterAll(async (done) => {
    await cleanUp(ctx);
    done();
});


test("create a basic profile with mandatory fields",  async() => {
    const args = {
            gcID: "09ujilkjlkiid",
            name: "Awesome User",
            email: "awesome.user@somewhere.com"
    };

    const info = "{ gcID, name, email }";

    expect(
        await mutations.createProfile(parent, args, ctx, info),
    ).toMatchSnapshot();
});

test("fail profile creation due to missing gcID", async() => {
    const args = {
        name: "Awesome User",
        email: "awesome.user@somewhere.com"
    };
     
    const info = "{ gcID, name, email }";

    try{
        await mutations.createProfile(parent, args, ctx, info);
    } catch(e){
        expect(e).toEqual(
            expect.objectContaining({
                message: expect.stringContaining("Field value.gcID of required type ID! was not provided")
            })  
        );
    }
});

test("fail profile creation due to missing name", async() => {

    const args = {
            gcID: "09ujilkjlkiid",
            email: "awesome.user@somewhere.com"
        };
               
        const info = "{ gcID, name, email }";

        try{
            await mutations.createProfile(parent, args, ctx, info);
        } catch(e){
            expect(e).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining("Field value.name of required type String! was not provided")
                })  
            );
        }
});

test("fail profile creation due to missing email", async() => {

        const args = {
            gcID: "09ujilkjlkiid",
            name: "Awesome User",
        };
        
        const info = "{ gcID, name, email }";
        
        try{
            await mutations.createProfile(parent, args, ctx, info);
        } catch(e){
            expect(e).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining("Field value.email of required type String! was not provided")
                })  
            );
        }

});