profile_service

# Validation

Some validation are implemented for some fields.

The field with **<--** have a specific validation.

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
In creation, only **gcId**, **name** and **email** are mandatory.
### Email Address
Email address must be formated like so:
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
When specifying an address to a profile in creation or in modification, every fields are **mandatory**.
### Coutry
The country must be a two letter ISO code. See [ISO 3166-1](https://en.wikipedia.org/wiki/ISO_3166-1).

### Province / State
The validation goes as follow:
* The **province/state** must be part of the country. If not, it will be considered as an invalid selection.
* For the case where the no **provinces/state** are available in the data, only a value is required.