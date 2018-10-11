profile_service

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