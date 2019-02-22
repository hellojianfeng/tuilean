# step-to-step-api: how to join org

This document describe steps to use api to complete join org task, these steps include:
1. create user. access http://xxx/users to create user, this use will use to create org
2. login. access http://xxx/authentication to login, get token and use for follow steps.
3. create org. access http://xxx/pages to create org, here create a school class as org
4. initialize org. access http://xxx/do-operation to initialize org, org will equiped with configured roles and so on.
5. create second user. say user2, this user will join school class created before
6. join org find-org action. find orgs for join
7. join org apply-org action. access http://xxx/pages with page name of join-org and action name of apply-join to join org
8. check sent notification. access http://xxx/notify to get sent notification by applying user
9. check received notification. access http://xxx/notify to get received notification to org-user-admin operation

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




## Create second user - ignore, same as create first user

## API For Find Orgs To Join Org

### API detail:

before access api, please add user token into header of Authorization

**URL** : http://host/pages

**Method**: POST

**POST Data**:

please note that:

1. page name must be 'join-org''
2. action must be 'find-org' to execute join action. actually join-org also support other actions, please refer to api document for more actions
3. can provide search data under data property. please refer to https://docs.feathersjs.com/ for syntax of query parameters

```JSON
{
    "page":"join-org",
    "action":"find-org",
    "data":{
        "$limit": 20
    }
}
```

**Response**:

return org list for user to join

```JSON
{
    "page": "join-org",
    "action": "find-org",
    "data": {},
    "user": {
        "_id": "5c6deba80e758dd951c0aed6",
        "email": "user2@example.com"
    },
    "result": [
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
```

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

## API For Checking Sent Notifications

### API Detail
before access api, please add user token into header of Authorization

**URL** : http://host/notify

**Method**: POST

**POST Data**:

please note that:

1. action must be 'find'
2. listen property and channel property under data are required. here means user2@example.com in page of join-org is find sent notifications.
3. can provide scopes, path or both for find a channel which is sent notifications

```JSON
{
    "action":"find",
    "data":{
        "sent":{
            "listen":"join-org",
            "channel":{
                "scopes":[
                    {
                        "owner":{
                        "user":"user2@example.com"
                    },
                    "pages":["join-org"]
                    }
                ]
            }
        }
    }
}
```
or
```JSON
{
    "action":"find",
    "data":{
        "sent":{
            "listen":"join-org",
            "channel":{
                "path":"page#join-org#user#user2@example.com"
            }
        }
    }
}
```

**Response**:

please note that: 
1. emit id is the event id for listen notification created be join-org, org-user-admin operation user should use it to listen notification to it's operation
2. this action will first create a channel for user2 who apply join org, then send notification from user2's channel to or-user-admin channel

```JSON
{
    "url": "/notify",
    "method": "POST",
    "action": "find",
    "user": {
        "_id": "5c6deba80e758dd951c0aed6",
        "email": "user2@example.com"
    },
    "data": {
        "sent": {
            "listen": "join-org",
            "channel": {
                "path": "page#join-org#user#user2@example.com"
            }
        }
    },
    "result": {
        "sent_notifications": [
            {
                "_id": "5c6debcf0e758dd951c0aed8",
                "path": "apply-join-org",
                "tags": "apply-join-org",
                "from_channel": {
                    "tags": [],
                    "_id": "5c6debcf0e758dd951c0aed7",
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
                    "_id": "5c6deb8a0e758dd951c0aec7",
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
                    "path": "org#class1#operation#org-user-admin",
                    "scopes_hash": "42f5a915280bc319a7c5fd21ab45a614ebb52fc2"
                },
                "listen": "join-org",
                "contents": [
                    {
                        "_id": "5c6debcf0e758dd951c0aeda",
                        "name": "message",
                        "type": "string",
                        "value": "apply-join-org, please process this request!"
                    },
                    {
                        "_id": "5c6debcf0e758dd951c0aed9",
                        "name": "org",
                        "type": "data.org",
                        "value": {
                            "_id": "5c6deb8a0e758dd951c0aec2",
                            "path": "class1"
                        }
                    }
                ],
                "sender": {
                    "_id": "5c6deba80e758dd951c0aed6",
                    "email": "user2@example.com"
                },
                "createdAt": "2019-02-21T00:07:43.178Z",
                "updatedAt": "2019-02-21T00:07:43.178Z",
                "__v": 0
            }
        ]
    }
}
```

## API For Checking Received Notifications
Received notification can be checked at two point for org-user-admin operation (here as example)
1. point 1: when open org notification UI in client, it should call this API to find received notifications
2. when some user is applying org, it will emit an event, in org notification client, it should listen notification event id and get latest notification. 
3. commonly should listen 'type'+listen+channel_id event id, for org-user-admin operation channel, listen event id should like 'notify-join-org-5c6deb8a0e758dd951c0aec7'

### API Detail
before access api, please add user token into header of Authorization

**URL** : http://host/notify

**Method**: POST

**POST Data**:

please note that:

1. action must be 'find'
2. listen property and channel property under data are required. here means operation org-user-admin is getting received message.
3. can provide scopes, path or both for find a channel which is receiving notifications
4. can provide $limit or $skip for receiving notifications

```JSON
{
    "action":"find",
    "data":{
        "received":{
            "$limit":10,
            "$skip": 0,
            "listen":"join-org",
            "channel":{
                "path":"org#class1#operation#org-user-admin"
            }
        }
    }
}
```

**Response**:

please note that: 
1. emit id is the event id for listen notification created be join-org, org-user-admin operation user should use it to listen notification to it's operation, emit id commonly is 'notify-listen-channel_id'

```JSON
{
    "url": "/notify",
    "method": "POST",
    "action": "find",
    "user": {
        "_id": "5c6deb6a0e758dd951c0aec0",
        "email": "user1@example.com"
    },
    "data": {
        "received": {
            "$limit": 10,
            "$skip": 0,
            "listen": "join-org",
            "channel": {
                "path": "org#class1#operation#org-user-admin"
            }
        }
    },
    "result": {
        "received_notifications": [
            {
                "_id": "5c6debcf0e758dd951c0aed8",
                "path": "apply-join-org",
                "tags": "apply-join-org",
                "from_channel": {
                    "tags": [],
                    "_id": "5c6debcf0e758dd951c0aed7",
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
                    "_id": "5c6deb8a0e758dd951c0aec7",
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
                    "path": "org#class1#operation#org-user-admin",
                    "scopes_hash": "42f5a915280bc319a7c5fd21ab45a614ebb52fc2"
                },
                "listen": "join-org",
                "contents": [
                    {
                        "_id": "5c6debcf0e758dd951c0aeda",
                        "name": "message",
                        "type": "string",
                        "value": "apply-join-org, please process this request!"
                    },
                    {
                        "_id": "5c6debcf0e758dd951c0aed9",
                        "name": "org",
                        "type": "data.org",
                        "value": {
                            "_id": "5c6deb8a0e758dd951c0aec2",
                            "path": "class1"
                        }
                    }
                ],
                "sender": {
                    "_id": "5c6deba80e758dd951c0aed6",
                    "email": "user2@example.com"
                },
                "createdAt": "2019-02-21T00:07:43.178Z",
                "updatedAt": "2019-02-21T00:07:43.178Z",
                "__v": 0
            }
        ]
    }
}
```