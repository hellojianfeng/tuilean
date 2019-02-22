# join-org page
this page is used for join org by user.
support actions: open(default), find-org, apply-join

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
  "page":"join-org",
  "action":"open"
}
```

#### Open Action Response Data

```JSON
{
    "page": "join-org",
    "action": "open",
    "user": {
        "_id": "5c6a6b336911cb49298f8ba1",
        "email": "user1@example.com"
    },
    "result": {
        "user_orgs": {
            "class2": {
                "_id": "5c6a6ba36911cb49298f8bb7",
                "channels": {
                    "allow": [],
                    "joined": [],
                    "joining": [],
                    "inviting": [],
                    "rejected": []
                },
                "name": "class2",
                "type": {
                    "_id": "5c6a6b666911cb49298f8ba2",
                    "path": "school.class.primary"
                },
                "path": "class2",
                "profiles": [],
                "follows": [],
                "createdAt": "2019-02-18T08:24:03.813Z",
                "updatedAt": "2019-02-18T08:24:03.813Z",
                "__v": 0
            },
            "class1": {
                "_id": "5c6a6b666911cb49298f8ba3",
                "channels": {
                    "allow": [],
                    "joined": [],
                    "joining": [],
                    "inviting": [],
                    "rejected": []
                },
                "name": "class1",
                "type": {
                    "_id": "5c6a6b666911cb49298f8ba2",
                    "path": "school.class.primary"
                },
                "path": "class1",
                "profiles": [],
                "follows": [],
                "createdAt": "2019-02-18T08:23:02.194Z",
                "updatedAt": "2019-02-18T08:23:02.194Z",
                "__v": 0
            }
        }
    }
}
````

#### Remarks

**page**: required

**action**: if not specify, default is open

**result**: this action return user joined orgs

### find-orgs Action

This action return orgs for user to join

#### find-orgs Action POST Data

```JSON
{
  "page":"join-org",
  "action":"find-org",
  "data":{
    "path":"class1"
  }
}
```

#### find-org Action Response Data

```JSON
{
    "page": "join-org",
    "action": "find-org",
    "data": {
        "path": "class1"
    },
    "user": {
        "_id": "5c6a6bb66911cb49298f8bcb",
        "email": "user2@example.com"
    },
    "result": [
        {
            "_id": "5c6a6b666911cb49298f8ba3",
            "channels": {
                "allow": [],
                "joined": [],
                "joining": [],
                "inviting": [],
                "rejected": []
            },
            "name": "class1",
            "type": {
                "_id": "5c6a6b666911cb49298f8ba2",
                "path": "school.class.primary"
            },
            "path": "class1",
            "profiles": [],
            "follows": [],
            "createdAt": "2019-02-18T08:23:02.194Z",
            "updatedAt": "2019-02-18T08:23:02.194Z",
            "__v": 0
        }
    ]
}
````

#### join-org Action Remarks

**page**: required

**action**: required

**data.path**: optional, data object will use for query to find orgs, please refer feathersjs query syntax. if not provide data object, will find all orgs to list

