# step-to-step-api: how to create and work with assignment

This document describe steps to use api to create assignment and work with assignment, these steps include:
1. create user of admin. access http://xxx/users to create user, this use will use to create org
2. login. access http://xxx/authentication to login, get token and use for follow steps.
3. create org. access http://xxx/pages to create org, here create a school class as org
4. initialize org. access http://xxx/do-operation to initialize org, org will equiped with configured roles and so on.
5. create more users. say teacher1, student1, student2, parent1, parent2, this user will join school class and work with assignment.
6. assign role to users. say teacher1 as teacher role, student1/student2 as student role and  parent1/parent2 as parent role.
7. login as teacher and go to assign-admin operation. use teacher1 account to login and then go to assignment-admin operation.
8. create assignment. teacher1 create assignment in assignment-admin operation.
9. update assignment until complete assignment. login in as student and update assignment status until complete assignment.
10. end assignment. after assignment complete, teacher can end(close) assignment.

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

## Create more user - steps are same as create first user.
please use teacher1@example.com as teacher account, student1@example.com | student2@example.com as student account, parent1@example.com | parent2@example.com as parent account.

## assign role to teacher, students and parents

### API detail:

before access api, please add user token into header of Authorization

**URL** : http://host/do-operation

**Method**: POST

**POST Data**:

please note that:

1. operation name must be 'org-user-admin''
2. action must be 'add-user-role' to add user role. actually org-user-admin also support other actions, please refer to api document for more actions
3. roles should be added before, for this case, roles have been added when initialize org.
4. for this assignment case, please add teacher1@example.com as teacher role, student1@example.com and student2@example.com as student role, parent1@example.com, parent2@example.com as parent role

```JSON
{
    "operation":"org-user-admin",
    "action":"add-user-role",
    "data":{
        "user":"teacher1@example.com",
        "role":"teacher"
    }
}
```

**Response**:

return org list for user to join

```JSON
{
    "operation": {
        "_id": "5cd377a7d0d4c0408e22fbe5",
        "path": "org-user-admin",
        "org_id": "5cd377a7d0d4c0408e22fbe1",
        "org_path": "class1"
    },
    "action": "add-user-role",
    "user": {
        "_id": "5cd37658f32d374069512485",
        "email": "admin@example.com"
    },
    "result": {
        "user": {
            "_id": "5cd37c22134d11414671d089",
            "email": "teacher1@example.com",
            "roles": [
                {
                    "_id": "5cd377bfd0d4c0408e22fbf0",
                    "path": "teacher",
                    "org_id": "5cd377a7d0d4c0408e22fbe1",
                    "org_path": "class1"
                }
            ],
            "permissions": [],
            "operations": [],
            "createdAt": "2019-05-09T01:02:26.471Z",
            "updatedAt": "2019-05-09T01:02:26.471Z",
            "__v": 0
        }
    }
}
```

## Login as teacher and create assignment

### API detail:

before access api, please add user token into header of Authorization

**URL** : http://host/do-operation

**Method**: POST

**POST Data**:

please note that:

1. page name must be 'assignment-admin'
2. 'create-assignment-start' action will list selections used for user's choice when create assignment.
3. 'create-assignment-end' action to execute create assignment action finaly. actually assignment-admin operation also support other actions, please refer to api document for more actions
4. each assignment will create a workflow, and each workflow include a lot works with status and actions.
5. required data include: "assignment", "assignment.path", "assignment.assign_to", "assignment.works", "assignment.works.status", "assignment.works.actions", "assignment.works.actions.path"

```JSON for create-assignment-start
{
    "operation": "assignment-admin",
    "org": "class1",
    "action": "create-assignment-start",
    "data": {}
}
```

```JSON for create-assignment-end
{
    "operation": "assignment-admin",
    "org": "class1",
    "action": "create-assignment-end",
    "data": {
        "assignment": {
            "name": "homework1",
            "path": "homework1",
            "assign_to": "every_student",
            "works": [
                {
                    "path": "update",
                    "status": "assigned",
                    "actions": [
                        {
                            "path": "update",
                            "operation": "assignment-home",
                            "users": [
                                "assigned_user"
                            ]
                        },
                        {
                            "path": "complete",
                            "operation": "assignment-home",
                            "users": [
                                "assigned_user"
                            ]
                        },
                        {
                            "path": "watch",
                            "operation": "assignment-home",
                            "users": [
                                "student_parent",
                                "self"
                            ]
                        }
                    ]
                },
                {
                    "path": "complete",
                    "status": "updated",
                    "actions": [
                    	{
                            "path": "update",
                            "operation": "assignment-home",
                            "users": [
                                "assigned_user"
                            ]
                        },
                        {
                            "path": "complete",
                            "operation": "assignment-home",
                            "users": [
                                "assigned_user"
                            ]
                        },
                        {
                            "path": "watch",
                            "operation": "assignment-home",
                            "users": [
                                "student_parent",
                                "self"
                            ]
                        }
                    ]
                },
                {
                    "status": "completed",
                    "actions": [
                        {
                            "path": "confirm",
                            "operation": "assignement-home",
                            "users": [
                                "self"
                            ]
                        },
                        {
                            "path": "end",
                            "operation": "assignment-home",
                            "users": [
                                "self"
                            ]
                        },
                        {
                            "path": "watch",
                            "operation": "assignment-home",
                            "users": [
                                "self"
                            ]
                        }
                    ]
                },
                {
                    "status": "confirmed",
                    "actions": [
                        {
                            "path": "end",
                            "operation": "assignment-home",
                            "users": [
                                "self"
                            ]
                        }
                    ]
                }
            ],
            "tasks": [
                {
                    "name": "homework1",
                    "path": "homework1",
                    "works": [
                        {
                            "status": "assigned"
                        },
                        {
                            "status": "updated"
                        },
                        {
                            "status": "completed"
                        },
                        {
                            "status": "confirmed"
                        },
                        {
                            "status": "end"
                        }
                    ],
                    "position": 0
                }
            ]
        }
    }
}
```

**Response**:

please note that: 
1. one assignment is created, teacher, student and parent will get notification to remind assignment
2. each role has different actions in assignment

```JSON for create-assignment-start
{
    "operation": {
        "_id": "5cd377bfd0d4c0408e22fbee",
        "path": "assignment-admin",
        "org_id": "5cd377a7d0d4c0408e22fbe1",
        "org_path": "class1"
    },
    "action": "create-assignment-start",
    "user": {
        "_id": "5cd37835d0d4c0408e22fbf9",
        "email": "teacher1@example.com"
    },
    "result": {
        "assignment_data": {
            "name": "give a name, option",
            "path": "give path, option",
            "description": "give some description, option"
        },
        "assigment_type_options": [
            {
                "name": "homework assignment",
                "key": "assignment.school.class.homework",
                "data": {
                    "assign_to_options": [
                        {
                            "name": "every student",
                            "key": "every_student"
                        },
                        {
                            "name": "select student",
                            "key": "select student"
                        },
                        {
                            "name": "select users",
                            "key": "select_users"
                        },
                        {
                            "name": "select roles",
                            "key": "select_roles"
                        }
                    ],
                    "assignment_work_status_options": [
                        "assigned",
                        "updated",
                        "confirmed"
                    ],
                    "assignment_work_action_options": [
                        "update",
                        "monitor",
                        "confirm"
                    ],
                    "assignment_work_action_by_options": [
                        "assigned_user",
                        "select_student",
                        "select_teacher",
                        "select_user",
                        "select_role"
                    ]
                }
            }
        ]
    }
}
```

```JSON for create-assignment-start
{
    "operation": {
        "_id": "5cd377bfd0d4c0408e22fbee",
        "path": "assignment-admin",
        "org_id": "5cd377a7d0d4c0408e22fbe1",
        "org_path": "class1"
    },
    "action": "create-assignment-end",
    "user": {
        "_id": "5cd37835d0d4c0408e22fbf9",
        "email": "teacher1@example.com"
    },
    "result": {
        "workflows": []
    }
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