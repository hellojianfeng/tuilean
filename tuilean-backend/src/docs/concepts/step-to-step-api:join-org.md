# step-to-step-api: how to join org

This document describe steps to use api to complete join org task, these steps include:
1. create user. access http://xxx/users to create user, this use will use to create org
2. login. access http://xxx/authentication to login, get token and use for follow steps.
3. create org. access http://xxx/pages to create org, here create a school class as org
4. initialize org. access http://xxx/do-operation to initialize org, org will equiped with configured roles and so on.
5. create second user. say user2, this user will join school class created before
6. join org. access http://xxx/pages with page name of join-org to join org

## API For Join Org

### API detail:

before access api, please add user token into header of Authorization

**URL** : http://host/pages

**Method**: POST

**POST Data**:

```JSON
{
    "email":"user2@example.com",
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
    "email": "user2@example.com",
    "roles": [],
    "permissions": [],
    "operations": [],
    "createdAt": "2019-02-20T05:30:19.779Z",
    "updatedAt": "2019-02-20T05:30:19.779Z",
    "__v": 0
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




## Create second user - ignore, same as create first user

## API For Join Org

### API detail:

before access api, please add user token into header of Authorization

**URL** : http://host/pages

**Method**: POST

**POST Data**:

please note that:

1. page name must be 'join-org''
2. action must be 'apply-join' to execute join action. actually join-org also support other actions, please refer to api document for more actions
3. org must be provided under data object.

```JSON
{
    "page":"join-org",
    "action":"apply-join",
    "data":{
        "org":"class1"
    }
}
```

**Response**:

please note that: 
1. emit id is the event id for listen notification created be join-org, org-user-admin operation user should use it to listen notification to it's operation
2. this action will first create a channel for user2 who apply join org, then send notification from user2's channel to or-user-admin channel

```JSON
{
    "_id": "5c6cea471e7810c5a2fdb291",
    "page": "join-org",
    "action": "apply-join",
    "data": {
        "org": "class1"
    },
    "result": {
        "notification": {
            "_id": "5c6cea471e7810c5a2fdb28e",
            "path": "apply-join-org",
            "tags": "apply-join-org",
            "from_channel": {
                "tags": [],
                "_id": "5c6ce64cc26fd0c3b55dae44",
                "scopes": [
                    {
                        "users": [],
                        "pages": [
                            "join-org"
                        ],
                        "owner": {
                            "user": "user2@example.com"
                        },
                        "orgs": [],
                        "roles": [],
                        "permissions": [],
                        "operations": []
                    }
                ],
                "path": "page#join-org#user#user2@example.com",
                "scopes_hash": "9652b21512c056c82c5f7ae67611fcabe7d18e34"
            },
            "to_channel": {
                "tags": [],
                "_id": "5c6cea361e7810c5a2fdb286",
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
                ],
                "path": "#org#class3#operation#org-user-admin",
                "scopes_hash": "32e157cc8f386befd5ed1b4274fef8a2e9153016"
            },
            "listen": "join-org",
            "contents": [
                {
                    "_id": "5c6cea471e7810c5a2fdb290",
                    "name": "message",
                    "type": "string",
                    "value": "apply-join-org, please process this request!"
                },
                {
                    "_id": "5c6cea471e7810c5a2fdb28f",
                    "name": "org",
                    "type": "data.org",
                    "value": {
                        "_id": "5c6cea361e7810c5a2fdb281",
                        "path": "class3"
                    }
                }
            ],
            "sender": {
                "_id": "5c6ce5ebc26fd0c3b55dae42",
                "email": "user2@example.com"
            },
            "createdAt": "2019-02-20T05:48:55.746Z",
            "updatedAt": "2019-02-20T05:48:55.746Z",
            "__v": 0
        },
        "emit": "notify-join-org-5c6cea361e7810c5a2fdb286"
    },
    "user": {
        "_id": "5c6ce5ebc26fd0c3b55dae42",
        "email": "user2@example.com"
    },
    "createdAt": "2019-02-20T05:48:55.752Z",
    "updatedAt": "2019-02-20T05:48:55.752Z",
    "__v": 0
}
```
