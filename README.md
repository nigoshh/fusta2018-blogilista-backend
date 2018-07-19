# fusta2018-blogilista-backend [![Build Status](https://travis-ci.com/nigoshh/fusta2018-blogilista-backend.svg?branch=master)](https://travis-ci.com/nigoshh/fusta2018-blogilista-backend)

University of Helsinki Full stack open 2018 course assignments

[git-frontend](https://github.com/nigoshh/fusta2018/tree/master/anekdootit/bloglist-frontend)
[heroku-backend](https://bloglist-be.herokuapp.com)
[heroku-frontend](https://bloglist-fe.herokuapp.com)

NB: to deploy this software (backend, frontend or both) with your own MongoDB database, please create a unique index for the field _username_ in the collection _bloglist-users_. Otherwise username uniqueness isn't enforced, therefore the software doesn't work as intended.

As explained here, you can create a unique index directly from the mongo shell by running the following command. Here _db_ is your database's name, and _bloglist-users_ is the collection that contains users data:

```
db.bloglist-users.createIndex( { "username": 1 }, { unique: true } )
```

Alternatively if you use [mlab](https://mlab.com) you can [create an index through the mLab management portal](https://docs.mlab.com/indexing/#add-index-via-mlab-portal); type _{ "username": 1 }_ in the _Keys_ field and check the _Unique_ option.
