# user-home page
This page is user's home page, will list all orgs for user

## prerequisite

need login to access this page, so access this page should with Authorization token in header.

## input & output

### URL

/pages

### open Action

This action return orgs for user

#### Open Action POST Data

```JSON
{
  "page":"user-home"
}
```

#### Open Action Response Data

```JSON
{
    "page": "user-home",
    "action": "open",
    "user": {
        "_id": "5c625f85463d5c7b3f9e1efa",
        "email": "user2@example.com"
    },
    "result": {
        "orgs": [
            {
                "_id": "5c6414945514637dcec31c3c",
                "channels": {
                    "allow": [],
                    "joined": [],
                    "joining": [],
                    "inviting": [],
                    "rejected": []
                },
                "name": "class1",
                "type": {
                    "_id": "5c6414945514637dcec31c3b",
                    "path": "school.class.primary"
                },
                "path": "class1",
                "profiles": [],
                "follows": [],
                "createdAt": "2019-02-13T12:59:00.807Z",
                "updatedAt": "2019-02-13T12:59:00.807Z",
                "__v": 0
            },
            {
                "_id": "5c6412525514637dcec31c2f",
                "channels": {
                    "allow": [],
                    "joined": [],
                    "joining": [],
                    "inviting": [],
                    "rejected": []
                },
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
            }
        ]
    }
}
````

#### Remarks

**page**: required

**action**: if not specify, default is open
