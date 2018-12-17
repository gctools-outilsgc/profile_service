profile_service

# Installation
This app/solution can be run in 2 different environments

## Development
To setup this application in development run the following commands:

* `sudo docker-compose -f docker-compose-dev.yml up`
* `sudo npm install`
* `cd prisma && yarn prisma deploy && cd ..`
* `NODE_ENV=development PRISMA_API_ENDPOINT=localhost node ./src/cluster.js`

The profile as a service playground endpoint can now be reached at http://localhost:4000/playground and the graphql endpoint at http://localhost:4000/graphql
The prisma service can be reached at http://localhost:4466/profile


## Production
To setup this application for production:

* `sudo docker-compose up --build -d`

The profile as a service playground endpoint can now be reached at http://localhost:4000/playground and the graphql endpoint at http://localhost:4000/graphql

# Tests
To run tests from the root of the project:
`sudo docker-compose -f docker-compose-test.yml up -d`
`sudo npm test`

# Validation

Validation is implemented for some fields.

Fields with **<--** have a specific validation.

```
profile
{
    gcId,
    name,
    email, <--
    avatar,
    mobilePhone, <--
    officePhone, <--
    address:
    {
        streetAddress,
        city,
        province, <--
        country, <--
        postalcode
    }
    titleEn,
    titleFr,
    supervisor,
    org 
}
```
## Profile
When initializing a 'Profile' only **gcId**, **name** and **email** are mandatory fields.
### Email Address
Email address must be formated as:
name@domain.domainExtension

*example:* myname@profile.com

### Mobile/Office Phone Number
Available format:

* ##########
* ###-###-####
* ###.###.####
* (###) ###-####
* (###)###-####
* +###########
* ###-#######

## Address
When specifying an address all fields are **mandatory** except in cases when an address already exists on a profile and it is only being modified.
### Country value
The country must be a two letter ISO code. See [ISO 3166-1](https://en.wikipedia.org/wiki/ISO_3166-1).

### Province / State value

* The **province/state** must be part of the country. If not, it will be considered as an invalid selection.
* For the case where the no **provinces/state** are available in the data, only a value is required.