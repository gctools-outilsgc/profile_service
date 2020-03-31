const mutations = require("../src/Resolvers/Mutations");
const { getContext, cleanUp } = require("./init/helper");


const parent = {};
var ctx = {};

beforeAll(async(done) => {
    ctx = await getContext();
    // Create base profile
        const args = {
                gcID: "asdf123456",
                name: "Awesome User",
                email: "awesome.user@somewhere.com"
        };

        const info = "{ gcID, name, email }";
        await mutations.createProfile(parent, args, ctx, info);    
        done();

});

afterAll(async(done) => {
    await cleanUp(ctx);
    done();
});

test("Address field valdiation - streetAddress", async() => {
    const args = {
        gcID:"asdf123456",
        data:{
            address:{
                city:"Ottawa",
                province:"Ontario",
                postalCode:"H0H 0H0",
                country:"Canada"
            }
        }
    };

    const info = "{gcID,name,address{streetAddress, city, province, postalCode, country}";

    try{
        await mutations.modifyProfile(parent, args, ctx, info);
    } catch(e){
        expect(e).toEqual(
            expect.objectContaining({
                message: expect.stringContaining("Missing Fields Required")
            })  
        );
    }
});

test("Address field valdiation - city", async() => {
    const args = {
        gcID:"asdf123456",
        data:{
            address:{
                streetAddress:"450 Blue Nose",
                province:"Ontario",
                postalCode:"H0H 0H0",
                country:"Canada"
            }
        }
    };

    const info = "{gcID,name,address{streetAddress, city, province, postalCode, country}";

    try{
        await mutations.modifyProfile(parent, args, ctx, info);
    } catch(e){
        expect(e).toEqual(
            expect.objectContaining({
                message: expect.stringContaining("Missing Fields Required")
            })  
        );
    }
});

test("Address field valdiation - province", async() => {
    const args = {
        gcID:"asdf123456",
        data:{
            address:{
                streetAddress:"450 Blue Nose",
                city:"Ottawa",
                postalCode:"H0H 0H0",
                country:"Canada"
            }
        }
    };

    const info = "{gcID,name,address{streetAddress, city, province, postalCode, country}";

    try{
        await mutations.modifyProfile(parent, args, ctx, info);
    } catch(e){
        expect(e).toEqual(
            expect.objectContaining({
                message: expect.stringContaining("Missing Fields Required")
            })  
        );
    }
});

test("Address field valdiation - postal code", async() => {
    const args = {
        gcID:"asdf123456",
        data:{
            address:{
                streetAddress:"450 Blue Nose",
                city:"Ottawa",
                province:"Ontario",
                country:"Canada"
            }
        }
    };

    const info = "{gcID,name,address{streetAddress, city, province, postalCode, country}";

    try{
        await mutations.modifyProfile(parent, args, ctx, info);
    } catch(e){
        expect(e).toEqual(
            expect.objectContaining({
                message: expect.stringContaining("Missing Fields Required")
            })  
        );
    }
});

test("Address field valdiation - country", async() => {
    const args = {
        gcID:"asdf123456",
        data:{
            address:{
                streetAddress:"450 Blue Nose",
                city:"Ottawa",
                province:"Ontario",
                postalCode:"H0H 0H0",
            }
        }
    };

    const info = "{gcID,name,address{streetAddress, city, province, postalCode, country}";

    try{
        await mutations.modifyProfile(parent, args, ctx, info);
    } catch(e){
        expect(e).toEqual(
            expect.objectContaining({
                message: expect.stringContaining("Missing Fields Required")
            })  
        );
    }
});

test("Non-existant profile for Modification", async() => {
    const args = {
        gcID: "098ohinjawef",
        data:{
            name:"Face Plant"
        }
    };

    const info = "{gcID, name}";

    try{
        await mutations.modifyProfile(parent, args, ctx, info);
    } catch(e){
        expect(e).toEqual(
            expect.objectContaining({
                message: expect.stringContaining("Profile does not exist")
            })  
        );
    }
});

test("Non-existant team for Modifcation", async() => {

    const args = {
        id: "098oihalknfdsaasdf",
        data:{
            nameEn:"Faker"
        }
    };

    const info = "{id, nameEn}";

    try{
        await mutations.modifyTeam(parent, args, ctx, info);
    } catch(e){
        expect(e).toEqual(
            expect.objectContaining({
                message: expect.stringContaining("Team does not exist")
            })
        );
    }
});
