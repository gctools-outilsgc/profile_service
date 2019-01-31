profile_service

# Installation
This app/solution can be run in 2 different environments. 

## Configuration
To configure this application there are 2 files that require mondifcation.

1. `./src/config.js`

    This file contains the majority of the variables that define the diference between your production, development, and test environments that are not secrets.

2. `./.env`

    This file contains the secrets required for the application and can be set eitehr through ENV variables or through this file.
* `MQ_USER` = Username for RabbitMQ instance set in `./src/config.js`
* `MQ_PASS` = Password for RabbitMQ instance

## Development
To setup this application in development run the following commands:

* `sudo docker-compose -f docker-compose-dev.yml up`
* `sudo npm install`
* `npm start dev`

The profile as a service playground endpoint can now be reached at http://localhost:4000/playground and the graphql endpoint at http://localhost:4000/graphql
The prisma service can be reached at http://localhost:4466/profile


## Production
To setup this application for production:

* `sudo docker-compose up --build -d`

The profile as a service playground endpoint can now be reached at http://localhost:4000/playground and the graphql endpoint at http://localhost:4000/graphql

# Tests
To run tests from the root of the project:
* `sudo docker-compose -f docker-compose-test.yml up -d`
* `npm test`

# Validation

Validation is implemented for some fields.

Fields with **<--** have a specific validation.

```
profile
{
    gcID,
    name,
    email, <--
    avatar,
    mobilePhone, <--
    officePhone, <--
    address:
    {
        streetAddress,
        city,
        province, 
        country, 
        postalcode
    }
    titleEn,
    titleFr,
    supervisor,
    org 
}
```
## Profile
When initializing a 'Profile' only **gcID**, **name** and **email** are mandatory fields.
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