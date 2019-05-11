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

```JSON for create-assignment-end
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
## API For student show assignments and update assignment

### API Detail
before access api, please add user token into header of Authorization.

**URL** : http://host/do-operation

**Method**: POST

**POST Data**:

please note that:

1. operation must be 'assignment-home'
2. action as "show-works" to list all works for student, actually teacher and parent can all find works by "show-works"
3. "do-work" is use to perform work action.

***Request for show-works by student***
```JSON 
{
    "operation": "assignment-home",
    "org": "class1",
    "action": "show-works"
}
```

***Response for show-works by student***
```JSON 
{
    "operation": {
        "_id": "5cd377bfd0d4c0408e22fbef",
        "path": "assignment-home",
        "org_id": "5cd377a7d0d4c0408e22fbe1",
        "org_path": "class1"
    },
    "action": "show-works",
    "user": {
        "_id": "5cd377e1d0d4c0408e22fbf5",
        "email": "student1@example.com"
    },
    "result": {
        "current_works": [
            {
                "_id": "5cd3806b134d11414671d09c",
                "workflow": {
                    "_id": "5cd3806a134d11414671d08c",
                    "type": "class-assignment",
                    "path": "assign_to_5cd377e1d0d4c0408e22fbf5"
                },
                "status": "joined",
                "operation": {
                    "_id": "5cd377bfd0d4c0408e22fbef",
                    "path": "assignment-home",
                    "org_path": "class1"
                },
                "user": {
                    "_id": "5cd377e1d0d4c0408e22fbf5",
                    "email": "student1@example.com"
                },
                "action": {
                    "path": "update"
                },
                "org_id": "5cd377a7d0d4c0408e22fbe1",
                "org_path": "class1",
                "work": {
                    "active": "true",
                    "_id": "5cd3806a134d11414671d090",
                    "executed": {
                        "workactions": [],
                        "users": []
                    },
                    "path": "update",
                    "status": "assigned"
                }
            },
            {
                "_id": "5cd3806b134d11414671d09d",
                "workflow": {
                    "_id": "5cd3806a134d11414671d08c",
                    "type": "class-assignment",
                    "path": "assign_to_5cd377e1d0d4c0408e22fbf5"
                },
                "status": "joined",
                "operation": {
                    "_id": "5cd377bfd0d4c0408e22fbef",
                    "path": "assignment-home",
                    "org_path": "class1"
                },
                "user": {
                    "_id": "5cd377e1d0d4c0408e22fbf5",
                    "email": "student1@example.com"
                },
                "action": {
                    "path": "complete"
                },
                "org_id": "5cd377a7d0d4c0408e22fbe1",
                "org_path": "class1",
                "work": {
                    "active": "true",
                    "_id": "5cd3806a134d11414671d090",
                    "executed": {
                        "workactions": [],
                        "users": []
                    },
                    "path": "update",
                    "status": "assigned"
                }
            }
        ],
        "previous_works": [],
        "history_works": []
    }
}
```

***explain to request and response of student show-works***
1. please refer to create-assignment-end request, can find one work in works like below json, it means in a update work, when work status is assigned, assigned user(here is student) can execute update action, meanwhile assigned user can execute complete action and student parent and teacher (here is self) can execute watch action

```JSON 
{
    "works": 
    [
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
        }
    ]
}
```
2. because student is assigned two action, so show-works response list two works, one have action of update and one has action of complete. 

***do-work request for update assignment by student***
```JSON 
{
    "operation": "assignment-home",
    "org": "class1",
    "action": "do-work",
    "data": {
        "work": {
            "_id": "5cd3806b134d11414671d09c",
            "workflow": {
                "_id": "5cd3806a134d11414671d08c",
                "type": "class-assignment",
                "path": "assign_to_5cd377e1d0d4c0408e22fbf5"
            },
            "status": "joined",
            "operation": {
                "_id": "5cd377bfd0d4c0408e22fbef",
                "path": "assignment-home",
                "org_path": "class1"
            },
            "user": {
                "_id": "5cd377e1d0d4c0408e22fbf5",
                "email": "student1@example.com"
            },
            "action": {
                "path": "update"
            },
            "org_id": "5cd377a7d0d4c0408e22fbe1",
            "org_path": "class1",
            "work": {
                "active": "true",
                "_id": "5cd3806a134d11414671d090",
                "executed": {
                    "workactions": [],
                    "users": []
                },
                "path": "update",
                "status": "assigned"
            }
        }
    }
}
```

***Response of do-work for update by student***
```JSON
{
    "operation": {
        "_id": "5cd377bfd0d4c0408e22fbef",
        "path": "assignment-home",
        "org_id": "5cd377a7d0d4c0408e22fbe1",
        "org_path": "class1"
    },
    "action": "do-work",
    "user": {
        "_id": "5cd377e1d0d4c0408e22fbf5",
        "email": "student1@example.com"
    },
    "result": {
        "current_works": [
            {
                "_id": "5cd3806b134d11414671d09f",
                "workflow": {
                    "_id": "5cd3806a134d11414671d08c",
                    "type": "class-assignment",
                    "path": "assign_to_5cd377e1d0d4c0408e22fbf5"
                },
                "status": "joined",
                "operation": {
                    "_id": "5cd377bfd0d4c0408e22fbef",
                    "path": "assignment-home",
                    "org_path": "class1"
                },
                "user": {
                    "_id": "5cd377e1d0d4c0408e22fbf5",
                    "email": "student1@example.com"
                },
                "action": {
                    "path": "update"
                },
                "org_id": "5cd377a7d0d4c0408e22fbe1",
                "org_path": "class1",
                "work": {
                    "active": "true",
                    "_id": "5cd3806a134d11414671d08f",
                    "executed": {
                        "workactions": [],
                        "users": []
                    },
                    "path": "complete",
                    "status": "updated"
                }
            },
            {
                "_id": "5cd3806b134d11414671d0a0",
                "workflow": {
                    "_id": "5cd3806a134d11414671d08c",
                    "type": "class-assignment",
                    "path": "assign_to_5cd377e1d0d4c0408e22fbf5"
                },
                "status": "joined",
                "operation": {
                    "_id": "5cd377bfd0d4c0408e22fbef",
                    "path": "assignment-home",
                    "org_path": "class1"
                },
                "user": {
                    "_id": "5cd377e1d0d4c0408e22fbf5",
                    "email": "student1@example.com"
                },
                "action": {
                    "path": "complete"
                },
                "org_id": "5cd377a7d0d4c0408e22fbe1",
                "org_path": "class1",
                "work": {
                    "active": "true",
                    "_id": "5cd3806a134d11414671d08f",
                    "executed": {
                        "workactions": [],
                        "users": []
                    },
                    "path": "complete",
                    "status": "updated"
                }
            }
        ],
        "previous_works": [
            {
                "_id": "5cd3806b134d11414671d09c",
                "workflow": {
                    "_id": "5cd3806a134d11414671d08c",
                    "type": "class-assignment",
                    "path": "assign_to_5cd377e1d0d4c0408e22fbf5"
                },
                "status": "joined",
                "operation": {
                    "_id": "5cd377bfd0d4c0408e22fbef",
                    "path": "assignment-home",
                    "org_path": "class1"
                },
                "user": {
                    "_id": "5cd377e1d0d4c0408e22fbf5",
                    "email": "student1@example.com"
                },
                "action": {
                    "path": "update"
                },
                "org_id": "5cd377a7d0d4c0408e22fbe1",
                "org_path": "class1",
                "work": {
                    "active": "true",
                    "_id": "5cd3806a134d11414671d090",
                    "executed": {
                        "workactions": [
                            {
                                "_id": "5cd3806b134d11414671d09c"
                            }
                        ],
                        "users": [
                            {
                                "_id": "5cd377e1d0d4c0408e22fbf5",
                                "email": "student1@example.com"
                            }
                        ]
                    },
                    "path": "update",
                    "status": "assigned"
                }
            }
        ],
        "history_works": []
    }
}
```

***explain to do-work request and response***
1. if want update assignment, should get one work from show-works response and find one item with action of update and then add it to do-work action data as showing in do-work request. after run request, backend will update assignment status by some data(here only change status, not provide additional data, later can upload some picture and then update status with some comments)
2. in response, can find current_works. current_works list pending works student can perform, according to assignment definition when create assignment, after update assignment, work status change to updated and student can continue to update or complete assigment, so can find two current_works here, but please note that works status change to updated and before work status is assigned(in assigned status, student can also do update or complete actio,).
3. in response, can find previous_works. previous_works list just completed works. please note that previous work status is assigned.
4. student can do complete work as any time, according to assignment definition (please refer to create-assignment-end action request), once complete, student should have no current works already and parent and teacher can watch assignment, finally teacher can end assignment.

***request of do-work for complete by student***
```JSON
{
    "operation": "assignment-home",
    "org": "class1",
    "action": "do-work",
    "data": {
        "work": {
            "_id": "5cd3806b134d11414671d0a0",
            "workflow": {
                "_id": "5cd3806a134d11414671d08c",
                "type": "class-assignment",
                "path": "assign_to_5cd377e1d0d4c0408e22fbf5"
            },
            "status": "joined",
            "operation": {
                "_id": "5cd377bfd0d4c0408e22fbef",
                "path": "assignment-home",
                "org_path": "class1"
            },
            "user": {
                "_id": "5cd377e1d0d4c0408e22fbf5",
                "email": "student1@example.com"
            },
            "action": {
                "path": "complete"
            },
            "org_id": "5cd377a7d0d4c0408e22fbe1",
            "org_path": "class1",
            "work": {
                "active": "true",
                "_id": "5cd3806a134d11414671d08f",
                "executed": {
                    "workactions": [],
                    "users": []
                },
                "path": "complete",
                "status": "updated"
            }
        }
    }
}
```

***response of do-work for complete by student***
```JSON
{
    "operation": {
        "_id": "5cd377bfd0d4c0408e22fbef",
        "path": "assignment-home",
        "org_id": "5cd377a7d0d4c0408e22fbe1",
        "org_path": "class1"
    },
    "action": "do-work",
    "user": {
        "_id": "5cd377e1d0d4c0408e22fbf5",
        "email": "student1@example.com"
    },
    "result": {
        "current_works": [],
        "previous_works": [
            {
                "_id": "5cd3806b134d11414671d0a0",
                "workflow": {
                    "_id": "5cd3806a134d11414671d08c",
                    "type": "class-assignment",
                    "path": "assign_to_5cd377e1d0d4c0408e22fbf5"
                },
                "status": "joined",
                "operation": {
                    "_id": "5cd377bfd0d4c0408e22fbef",
                    "path": "assignment-home",
                    "org_path": "class1"
                },
                "user": {
                    "_id": "5cd377e1d0d4c0408e22fbf5",
                    "email": "student1@example.com"
                },
                "action": {
                    "path": "complete"
                },
                "org_id": "5cd377a7d0d4c0408e22fbe1",
                "org_path": "class1",
                "work": {
                    "active": "true",
                    "_id": "5cd3806a134d11414671d08f",
                    "executed": {
                        "workactions": [
                            {
                                "_id": "5cd3806b134d11414671d0a0"
                            }
                        ],
                        "users": [
                            {
                                "_id": "5cd377e1d0d4c0408e22fbf5",
                                "email": "student1@example.com"
                            }
                        ]
                    },
                    "path": "complete",
                    "status": "updated"
                }
            }
        ],
        "history_works": [
            {
                "_id": "5cd3806b134d11414671d09c",
                "workflow": {
                    "_id": "5cd3806a134d11414671d08c",
                    "type": "class-assignment",
                    "path": "assign_to_5cd377e1d0d4c0408e22fbf5"
                },
                "status": "joined",
                "operation": {
                    "_id": "5cd377bfd0d4c0408e22fbef",
                    "path": "assignment-home",
                    "org_path": "class1"
                },
                "user": {
                    "_id": "5cd377e1d0d4c0408e22fbf5",
                    "email": "student1@example.com"
                },
                "action": {
                    "path": "update"
                },
                "org_id": "5cd377a7d0d4c0408e22fbe1",
                "org_path": "class1",
                "work": {
                    "active": "true",
                    "_id": "5cd3806a134d11414671d090",
                    "executed": {
                        "workactions": [
                            {
                                "_id": "5cd3806b134d11414671d09c"
                            }
                        ],
                        "users": [
                            {
                                "_id": "5cd377e1d0d4c0408e22fbf5",
                                "email": "student1@example.com"
                            }
                        ]
                    },
                    "path": "update",
                    "status": "assigned"
                }
            }
        ]
    }
}
```

***response of show-work by teacher***

just login as teacher and run show-works action(refer to above show-works action request), please note that teacher can perform end action in current_works. meanwhile please note that teacher can watch other assignment (please refer to create-assignment to know two assignments are create for two student in this case, and one is completed and teacher can end assignment and second one is assigned status and teacher can watch)

```JSON
{
    "operation": {
        "_id": "5cd377bfd0d4c0408e22fbef",
        "path": "assignment-home",
        "org_id": "5cd377a7d0d4c0408e22fbe1",
        "org_path": "class1"
    },
    "action": "show-works",
    "user": {
        "_id": "5cd37835d0d4c0408e22fbf9",
        "email": "teacher1@example.com"
    },
    "result": {
        "current_works": [
            {
                "_id": "5cd3806b134d11414671d0a3",
                "workflow": {
                    "_id": "5cd3806a134d11414671d08c",
                    "type": "class-assignment",
                    "path": "assign_to_5cd377e1d0d4c0408e22fbf5"
                },
                "status": "joined",
                "operation": {
                    "_id": "5cd377bfd0d4c0408e22fbef",
                    "path": "assignment-home",
                    "org_path": "class1"
                },
                "user": {
                    "_id": "5cd37835d0d4c0408e22fbf9",
                    "email": "teacher1@example.com"
                },
                "action": {
                    "path": "end"
                },
                "org_id": "5cd377a7d0d4c0408e22fbe1",
                "org_path": "class1",
                "work": {
                    "active": "true",
                    "_id": "5cd3806a134d11414671d08e",
                    "executed": {
                        "workactions": [],
                        "users": []
                    },
                    "status": "completed"
                }
            },
            {
                "_id": "5cd3806b134d11414671d0a4",
                "workflow": {
                    "_id": "5cd3806a134d11414671d08c",
                    "type": "class-assignment",
                    "path": "assign_to_5cd377e1d0d4c0408e22fbf5"
                },
                "status": "joined",
                "operation": {
                    "_id": "5cd377bfd0d4c0408e22fbef",
                    "path": "assignment-home",
                    "org_path": "class1"
                },
                "user": {
                    "_id": "5cd37835d0d4c0408e22fbf9",
                    "email": "teacher1@example.com"
                },
                "action": {
                    "path": "watch"
                },
                "org_id": "5cd377a7d0d4c0408e22fbe1",
                "org_path": "class1",
                "work": {
                    "active": "true",
                    "_id": "5cd3806a134d11414671d08e",
                    "executed": {
                        "workactions": [],
                        "users": []
                    },
                    "status": "completed"
                }
            },
            {
                "_id": "5cd3806b134d11414671d0b9",
                "workflow": {
                    "_id": "5cd3806b134d11414671d0a7",
                    "type": "class-assignment",
                    "path": "assign_to_5cd377e6d0d4c0408e22fbf6"
                },
                "status": "joined",
                "operation": {
                    "_id": "5cd377bfd0d4c0408e22fbef",
                    "path": "assignment-home",
                    "org_path": "class1"
                },
                "user": {
                    "_id": "5cd37835d0d4c0408e22fbf9",
                    "email": "teacher1@example.com"
                },
                "action": {
                    "path": "watch"
                },
                "org_id": "5cd377a7d0d4c0408e22fbe1",
                "org_path": "class1",
                "work": {
                    "active": "true",
                    "_id": "5cd3806b134d11414671d0ab",
                    "executed": {
                        "workactions": [],
                        "users": []
                    },
                    "path": "update",
                    "status": "assigned"
                }
            }
        ],
        "previous_works": [],
        "history_works": []
    }
}
```

***request of do-work for end by teacher***
```JSON
{
    "operation": "assignment-home",
    "org": "class1",
    "action": "do-work",
    "data": {
        "work": {
            "_id": "5cd3806b134d11414671d0a3",
            "workflow": {
                "_id": "5cd3806a134d11414671d08c",
                "type": "class-assignment",
                "path": "assign_to_5cd377e1d0d4c0408e22fbf5"
            },
            "status": "joined",
            "operation": {
                "_id": "5cd377bfd0d4c0408e22fbef",
                "path": "assignment-home",
                "org_path": "class1"
            },
            "user": {
                "_id": "5cd37835d0d4c0408e22fbf9",
                "email": "teacher1@example.com"
            },
            "action": {
                "path": "end"
            },
            "org_id": "5cd377a7d0d4c0408e22fbe1",
            "org_path": "class1",
            "work": {
                "active": "true",
                "_id": "5cd3806a134d11414671d08e",
                "executed": {
                    "workactions": [],
                    "users": []
                },
                "status": "completed"
            }
        }
    }
}
```

***response of do-work for end assignment by teacher***
```JSON
{
    "operation": {
        "_id": "5cd377bfd0d4c0408e22fbef",
        "path": "assignment-home",
        "org_id": "5cd377a7d0d4c0408e22fbe1",
        "org_path": "class1"
    },
    "action": "do-work",
    "user": {
        "_id": "5cd37835d0d4c0408e22fbf9",
        "email": "teacher1@example.com"
    },
    "result": {
        "current_works": [
            {
                "_id": "5cd3806b134d11414671d0b9",
                "workflow": {
                    "_id": "5cd3806b134d11414671d0a7",
                    "type": "class-assignment",
                    "path": "assign_to_5cd377e6d0d4c0408e22fbf6"
                },
                "status": "joined",
                "operation": {
                    "_id": "5cd377bfd0d4c0408e22fbef",
                    "path": "assignment-home",
                    "org_path": "class1"
                },
                "user": {
                    "_id": "5cd37835d0d4c0408e22fbf9",
                    "email": "teacher1@example.com"
                },
                "action": {
                    "path": "watch"
                },
                "org_id": "5cd377a7d0d4c0408e22fbe1",
                "org_path": "class1",
                "work": {
                    "active": "true",
                    "_id": "5cd3806b134d11414671d0ab",
                    "executed": {
                        "workactions": [],
                        "users": []
                    },
                    "path": "update",
                    "status": "assigned"
                }
            }
        ],
        "previous_works": [
            {
                "_id": "5cd3806b134d11414671d0a3",
                "workflow": {
                    "_id": "5cd3806a134d11414671d08c",
                    "type": "class-assignment",
                    "path": "assign_to_5cd377e1d0d4c0408e22fbf5"
                },
                "status": "joined",
                "operation": {
                    "_id": "5cd377bfd0d4c0408e22fbef",
                    "path": "assignment-home",
                    "org_path": "class1"
                },
                "user": {
                    "_id": "5cd37835d0d4c0408e22fbf9",
                    "email": "teacher1@example.com"
                },
                "action": {
                    "path": "end"
                },
                "org_id": "5cd377a7d0d4c0408e22fbe1",
                "org_path": "class1",
                "work": {
                    "active": "true",
                    "_id": "5cd3806a134d11414671d08e",
                    "executed": {
                        "workactions": [
                            {
                                "_id": "5cd3806b134d11414671d0a3"
                            }
                        ],
                        "users": [
                            {
                                "_id": "5cd37835d0d4c0408e22fbf9",
                                "email": "teacher1@example.com"
                            }
                        ]
                    },
                    "status": "completed"
                }
            }
        ],
        "history_works": []
    }
}
```