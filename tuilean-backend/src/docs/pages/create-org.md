# create-org page

## prerequisite

need login to access this page, so access this page should with Authorization token in header.

## input & output

### URL :

/pages

### open Action

This action return types for creating org

#### Open Action POST Data

```JSON
{
  "page":"create-org",
  "action":"open"
}
```

#### Open Action Response Data

```JSON
{
    "page": "create-org",
    "action": "open",
    "user": {
        "_id": "5c625f85463d5c7b3f9e1efa",
        "email": "user2@example.com"
    },
    "result": {
        "types": [
            {
                "_id": "5c623df12075de797a00ef5c",
                "path": "company.clean",
                "owner": "orgs",
                "name": "company.clean",
                "createdAt": "2019-02-12T03:30:57.789Z",
                "updatedAt": "2019-02-12T03:30:57.789Z",
                "__v": 0
            },
            {
                "_id": "5c623e0a2075de797a00ef72",
                "path": "company.department.system",
                "owner": "orgs",
                "name": "company.department.system",
                "createdAt": "2019-02-12T03:31:22.192Z",
                "updatedAt": "2019-02-12T03:31:22.192Z",
                "__v": 0
            }
        ]
    }
}
````

#### Remarks

**page**: required

**action**: if not specify, default is open

### create Action

This action create a new org

#### Create Action POST Data

```JSON
{
  "page":"create-org",
  "action":"create",
  "data":{
    "name":"company5",
    "type":"company.clean"
  }
}
```

#### Create Action Response Data

```JSON
{
    "_id": "5c6412525514637dcec31c3a",
    "page": "create-org",
    "action": "create",
    "data": {
        "name": "company5",
        "type": {
            "_id": "5c623df12075de797a00ef5c",
            "path": "company.clean"
        },
        "path": "company5"
    },
    "result": {
        "channels": {
            "allow": [],
            "joined": [],
            "joining": [],
            "inviting": [],
            "rejected": []
        },
        "_id": "5c6412525514637dcec31c2f",
        "name": "company5",
        "type": {
            "_id": "5c623df12075de797a00ef5c",
            "path": "company.clean"
        },
        "path": "company5",
        "profiles": [],
        "follows": [],
        "createdAt": "2019-02-13T12:49:22.603Z",
        "updatedAt": "2019-02-13T12:49:22.603Z",
        "__v": 0
    },
    "user": {
        "_id": "5c625f85463d5c7b3f9e1efa",
        "email": "user2@example.com"
    },
    "createdAt": "2019-02-13T12:49:22.660Z",
    "updatedAt": "2019-02-13T12:49:22.660Z",
    "__v": 0
}
````

#### Create Action Remarks

**page**: required

**action**: required

**data.name**: required, should be unique name, also can be **data.path**

**data.type**: required, access open action will list all types
