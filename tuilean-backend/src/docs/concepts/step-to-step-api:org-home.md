# step-to-step-api: show org-home and list user's operations in org

This document describe steps to use api to open org-home operation, which will list all user's operations in org, these steps include:
1. create user. access http://xxx/users to create user, this use will use to create org
2. login. access http://xxx/authentication to login, get token and use for follow steps.
3. create org. access http://xxx/pages to create org, here create a school class as org
4. initialize org. access http://xxx/do-operation to initialize org, org will equiped with configured roles and so on.
5. create more orgs and initialize them.
6. access user-home page to list all orgs for user
7. access one org and open org-home operation for user and list all operations.

## API For Create User

### API detail:

**URL** : http://host/users

**Method**: POST

**POST Data**:

```JSON
{
    "email":"user1@example.com",
    "password":"secret"
}
```

**Response**:

```JSON
{
    "channels": {
        "allow": [],
        "joined": [],
        "joining": [],
        "inviting": [],
        "rejected": []
    },
    "_id": "5c6ce5ebc26fd0c3b55dae42",
    "email": "user1@example.com",
    "roles": [],
    "permissions": [],
    "operations": [],
    "createdAt": "2019-02-20T05:30:19.779Z",
    "updatedAt": "2019-02-20T05:30:19.779Z",
    "__v": 0
}
```

## API For Login User

### API detail:

**URL** : http://host/authentication

**Method**: POST

**POST Data**:

```JSON
{
    "email":"user1@example.com",
    "password":"secret",
    "strategy":"local"
}
```

**Response**:
remarks for response:
1. please copy accessToken and put into Authorization header in follow request for identify user.

```JSON
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJ1c2VySWQiOiI1YzZkZWI2YTBlNzU4ZGQ5NTFjMGFlYzAiLCJpYXQiOjE1NTA4MTI3ODcsImV4cCI6MTU1MDg5OTE4NywiYXVkIjoiaHR0cHM6Ly95b3VyZG9tYWluLmNvbSIsImlzcyI6ImZlYXRoZXJzIiwic3ViIjoiYW5vbnltb3VzIiwianRpIjoiZTQ0MDVhNzgtMjU2Yi00NWQ3LTliNGYtY2IyOTM5OWI4NWY5In0.SRdNhNXqy1swrgF_cLXgRyKm2R5aQfyCzgNNzHnvKAc"
}
```

## API For Create Org

### API detail:

before access api, please add user token into header of Authorization

**URL** : http://host/pages

**Method**: POST

**POST Data**:

please note that:

1. page name must be 'create-org''
2. action must be 'create' to execute create action. actually create-org also support other actions, please refer to api document for create-org page
3. name and type must provide under data object.

```JSON
{
    "page":"create-org",
    "action":"create",
    "data":{
        "name":"class1",
        "type":"school.class.primary"
    }
}
```

**Response**:

```JSON
{
    "_id": "5c6cea361e7810c5a2fdb28d",
    "page": "create-org",
    "action": "create",
    "data": {
        "name": "class1",
        "type": {
            "_id": "5c6cae7f434c579a03e19adf",
            "path": "school.class.primary"
        },
        "path": "class1"
    },
    "result": {
        "channels": {
            "allow": [],
            "joined": [],
            "joining": [],
            "inviting": [],
            "rejected": []
        },
        "_id": "5c6cea361e7810c5a2fdb281",
        "name": "class1",
        "type": {
            "_id": "5c6cae7f434c579a03e19adf",
            "path": "school.class.primary"
        },
        "path": "class1",
        "profiles": [],
        "follows": [],
        "createdAt": "2019-02-20T05:48:38.776Z",
        "updatedAt": "2019-02-20T05:48:38.776Z",
        "__v": 0
    },
    "user": {
        "_id": "5c6cae64434c579a03e19ade",
        "email": "user1@example.com"
    },
    "createdAt": "2019-02-20T05:48:38.863Z",
    "updatedAt": "2019-02-20T05:48:38.863Z",
    "__v": 0
}
```

## API For Initialize org

### API detail:

before access api, please add user token into header of Authorization

**URL** : http://host/do-operation

**Method**: POST

**POST Data**:

please note that:

1. operation name must be 'org-initialize''
2. action must be 'initialize' to execute create action. actually org-initialize operation also support other actions, please refer to api document for more actions
3. org must be provided for initialized org.

```JSON
{
	"operation":"org-initialize",
	"org":"class1",
	"action":"initialize"
}
```

**Response**:

```JSON
{
    "_id": "5c6cf80b449f79ca37403bb1",
    "operation": "org-initialize",
    "action": "initialize",
    "result": {
        "message": "org-initialize is successfully!",
        "org": {
            "_id": "5c6cae7f434c579a03e19ae0",
            "channels": {
                "allow": [],
                "joined": [],
                "joining": [],
                "inviting": [],
                "rejected": []
            },
            "name": "class1",
            "type": {
                "_id": "5c6cae7f434c579a03e19adf",
                "path": "school.class.primary"
            },
            "path": "class1",
            "profiles": [],
            "follows": [],
            "createdAt": "2019-02-20T01:33:51.302Z",
            "updatedAt": "2019-02-20T01:33:51.302Z",
            "__v": 0
        },
        "newOperations": [
            {
                "channels": {
                    "allow": [],
                    "joined": [],
                    "joining": [],
                    "inviting": [],
                    "rejected": []
                },
                "app": "school",
                "_id": "5c6cf80a449f79ca37403bab",
                "path": "class-assignment-admin",
                "org_id": "5c6cae7f434c579a03e19ae0",
                "org_path": "class1",
                "name": "class-assignment-admin",
                "stages": [],
                "createdAt": "2019-02-20T06:47:38.892Z",
                "updatedAt": "2019-02-20T06:47:38.892Z",
                "__v": 0
            },
            {
                "channels": {
                    "allow": [],
                    "joined": [],
                    "joining": [],
                    "inviting": [],
                    "rejected": []
                },
                "app": "school",
                "_id": "5c6cf80a449f79ca37403bac",
                "path": "class-assignment-do",
                "org_id": "5c6cae7f434c579a03e19ae0",
                "org_path": "class1",
                "name": "class-assignment-do",
                "stages": [],
                "createdAt": "2019-02-20T06:47:38.900Z",
                "updatedAt": "2019-02-20T06:47:38.900Z",
                "__v": 0
            }
        ],
        "newRoles": [
            {
                "_id": "5c6cf80a449f79ca37403bae",
                "path": "teacher",
                "org_id": "5c6cae7f434c579a03e19ae0",
                "org_path": "class1",
                "name": "teacher",
                "permissions": [],
                "operations": [
                    {
                        "_id": "5c6cf80a449f79ca37403bab",
                        "path": "class-assignment-admin"
                    }
                ],
                "createdAt": "2019-02-20T06:47:38.907Z",
                "updatedAt": "2019-02-20T06:47:38.907Z",
                "__v": 0
            },
            {
                "_id": "5c6cf80a449f79ca37403baf",
                "path": "student",
                "org_id": "5c6cae7f434c579a03e19ae0",
                "org_path": "class1",
                "name": "student",
                "permissions": [],
                "operations": [
                    {
                        "_id": "5c6cf80a449f79ca37403bac",
                        "path": "class-assignment-do"
                    }
                ],
                "createdAt": "2019-02-20T06:47:38.909Z",
                "updatedAt": "2019-02-20T06:47:38.909Z",
                "__v": 0
            },
            {
                "_id": "5c6cf80a449f79ca37403bb0",
                "path": "parent",
                "operations": [
                    {
                        "include": {
                            "children": [],
                            "parent": []
                        },
                        "exclude": {
                            "children": [],
                            "parent": []
                        },
                        "_id": "5c6cf80a449f79ca37403bac",
                        "path": "class-assignment-do"
                    }
                ],
                "permissions": [
                    {
                        "include": {
                            "children": [],
                            "parent": []
                        },
                        "exclude": {
                            "children": [],
                            "parent": []
                        },
                        "_id": "5c6cf80a449f79ca37403bad",
                        "path": "class-assignment-monitor"
                    }
                ],
                "org_id": "5c6cae7f434c579a03e19ae0",
                "org_path": "class1",
                "name": "parent",
                "createdAt": "2019-02-20T06:47:38.917Z",
                "updatedAt": "2019-02-20T06:47:38.917Z",
                "__v": 0
            }
        ],
        "newPermissions": [
            {
                "_id": "5c6cf80a449f79ca37403bad",
                "path": "class-assignment-monitor",
                "org_id": "5c6cae7f434c579a03e19ae0",
                "org_path": "class1",
                "name": "class-assignment-monitor",
                "operations": [],
                "createdAt": "2019-02-20T06:47:38.904Z",
                "updatedAt": "2019-02-20T06:47:38.904Z",
                "__v": 0
            }
        ],
        "newOrgs": []
    },
    "operation_id": "5c6cae7f434c579a03e19ae1",
    "org_id": "5c6cae7f434c579a03e19ae0",
    "org_path": "class1",
    "user": {
        "_id": "5c6cae64434c579a03e19ade",
        "email": "user1@example.com"
    },
    "createdAt": "2019-02-20T06:47:39.196Z",
    "updatedAt": "2019-02-20T06:47:39.196Z",
    "__v": 0
}
```




## Create more orgs and initialize them - ignore, same as create and initialize first org

## API For User-Home page to list users'orgs

### API detail:

before access api, please add user token into header of Authorization

**URL** : http://host/pages

**Method**: POST

**POST Data**:

please note that:

1. page name must be 'user-home'.
2. action name of open is optional.

```JSON
{
    "page":"user-home",
    "action":"open"
}
```

**Response**:

return org list that user is joined(or created) already

```JSON
{
    "page": "user-home",
    "action": "open",
    "user": {
        "_id": "5c6deb6a0e758dd951c0aec0",
        "email": "user1@example.com"
    },
    "result": {
        "orgs": [
            {
                "_id": "5c6f801e603c804268ab9b76",
                "channels": {
                    "allow": [],
                    "joined": [],
                    "joining": [],
                    "inviting": [],
                    "rejected": []
                },
                "name": "class2",
                "type": {
                    "_id": "5c6deb8a0e758dd951c0aec1",
                    "path": "school.class.primary"
                },
                "path": "class2",
                "profiles": [],
                "follows": [],
                "createdAt": "2019-02-22T04:52:46.765Z",
                "updatedAt": "2019-02-22T04:52:46.765Z",
                "__v": 0
            },
            {
                "_id": "5c6deb8a0e758dd951c0aec2",
                "channels": {
                    "allow": [],
                    "joined": [],
                    "joining": [],
                    "inviting": [],
                    "rejected": []
                },
                "name": "class1",
                "type": {
                    "_id": "5c6deb8a0e758dd951c0aec1",
                    "path": "school.class.primary"
                },
                "path": "class1",
                "profiles": [],
                "follows": [],
                "createdAt": "2019-02-21T00:06:34.363Z",
                "updatedAt": "2019-02-21T00:06:34.363Z",
                "__v": 0
            },
            {
                "_id": "5c6f8023603c804268ab9b83",
                "channels": {
                    "allow": [],
                    "joined": [],
                    "joining": [],
                    "inviting": [],
                    "rejected": []
                },
                "name": "class3",
                "type": {
                    "_id": "5c6deb8a0e758dd951c0aec1",
                    "path": "school.class.primary"
                },
                "path": "class3",
                "profiles": [],
                "follows": [],
                "createdAt": "2019-02-22T04:52:51.808Z",
                "updatedAt": "2019-02-22T04:52:51.808Z",
                "__v": 0
            },
            {
                "_id": "5c6f802b603c804268ab9b90",
                "channels": {
                    "allow": [],
                    "joined": [],
                    "joining": [],
                    "inviting": [],
                    "rejected": []
                },
                "name": "class4",
                "type": {
                    "_id": "5c6deb8a0e758dd951c0aec1",
                    "path": "school.class.primary"
                },
                "path": "class4",
                "profiles": [],
                "follows": [],
                "createdAt": "2019-02-22T04:52:59.932Z",
                "updatedAt": "2019-02-22T04:52:59.932Z",
                "__v": 0
            },
            {
                "_id": "5c6f8030603c804268ab9b9d",
                "channels": {
                    "allow": [],
                    "joined": [],
                    "joining": [],
                    "inviting": [],
                    "rejected": []
                },
                "name": "class5",
                "type": {
                    "_id": "5c6deb8a0e758dd951c0aec1",
                    "path": "school.class.primary"
                },
                "path": "class5",
                "profiles": [],
                "follows": [],
                "createdAt": "2019-02-22T04:53:04.836Z",
                "updatedAt": "2019-02-22T04:53:04.836Z",
                "__v": 0
            }
        ]
    }
}
```

## API For Org-Home operation to list all user's operations in org

### API detail:

before access api, please add user token into header of Authorization

**URL** : http://host/do-operation

**Method**: POST

**POST Data**:

please note that:

1. operation name must be 'org-home'
2. org must be provided under data object.

```JSON
{
	"operation":"org-home",
	"org":"class1"
}
```

**Response**:

please note that: 
1. all operations for user under org is listed

```JSON
{
    "operation": {
        "_id": "5c6deb8a0e758dd951c0aec4",
        "path": "org-home",
        "org_id": "5c6deb8a0e758dd951c0aec2",
        "org_path": "class1"
    },
    "action": "open",
    "user": {
        "_id": "5c6deb6a0e758dd951c0aec0",
        "email": "user1@example.com"
    },
    "result": {
        "operations": [
            {
                "_id": "5c6deb8a0e758dd951c0aec6",
                "channels": {
                    "allow": [],
                    "joined": [
                        {
                            "tags": [],
                            "_id": "5c6deb8a0e758dd951c0aec7",
                            "path": "org#class1#operation#org-user-admin",
                            "scopes_hash": "42f5a915280bc319a7c5fd21ab45a614ebb52fc2",
                            "scopes": [
                                {
                                    "users": [],
                                    "pages": [],
                                    "owner": {
                                        "operation": {
                                            "path": "org-user-admin",
                                            "org_path": "class1"
                                        }
                                    },
                                    "orgs": [],
                                    "roles": [],
                                    "permissions": [],
                                    "operations": []
                                }
                            ]
                        }
                    ],
                    "joining": [],
                    "inviting": [],
                    "rejected": []
                },
                "app": "default",
                "name": "org-user-admin",
                "org_id": "5c6deb8a0e758dd951c0aec2",
                "org_path": "class1",
                "path": "org-user-admin",
                "stages": [],
                "createdAt": "2019-02-21T00:06:34.377Z",
                "updatedAt": "2019-02-21T00:06:34.409Z",
                "__v": 0
            }
        ]
    }
}
```
