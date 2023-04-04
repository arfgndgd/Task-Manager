const express = require('express');
const app = express();
const { mongoose } = require('./db/mongoose');
const bodyParser = require('body-parser');
// Load in the mongoose models
const { List, Task, User } = require('./db/models');


/* MIDDLEWARE */

// LOAD MIDDLEWARE
app.use(bodyParser.json());


// CORS HEADERS MIDDLEWARE
// https://enable-cors.org/server_expressjs.html
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // ikinci parametre * şuan, yoksa cors hatası gelir buraya domain yazılabilir
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");
    res.header(	
        'Access-Control-Expose-Headers',	
        'x-access-token, x-refresh-token'	
    );
    next();
});

// Refresh Token Middleware'i Doğrulayın (bu, oturumu doğrulayacaktır)
let verifySession = (req, res, next) => {
    let refreshToken = req.header('x-refresh-token');

    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldnt be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }

        // eğer kod buraya ulaşırsa -kullanıcı bulunmuştur
        // bu nedenle yenileme belirteci veritabanında var - ancak yine de süresinin dolup dolmadığını kontrol etmeliyiz 

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // session süresinin dolup dolmadığını kontrol edilmesi
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID -call next() to continue with processing this web request 
            // oturum GEÇERLİ - bu web isteğini işlemeye devam etmek için next() öğesini arayın
            next();
        } else {
            // session valid değil
            return Promise.reject({
                'error': 'Refresh ttoken has expired or the session is invalid'
            })
        }
    }).catch((e) => {
        res.status(401).send(e);
    })
}
/* END MIDDLEWARE */

/* ROUTE HANDLERS */

/* 
 * GET /lists
 * Purpose: Get all lists
 */
app.get('/lists', (req, res) => {
    List.find({}).then((lists) => {
        res.send(lists);
    });
})

/* 
 * POST /lists
 * Purpose: Create a list
 */
app.post('/lists', (req, res) => {
    let title = req.body.title;

    let newList = new List({
        title
    });
    newList.save().then((listDoc) => {
        //tüm listeyi döndürür (incl. id)
        res.send(listDoc);
    });
})

/* 
 * PATH /lists/:id
 * Purpose: Update a specified list
 */
app.patch('/lists/:id', (req, res) => {
    List.findOneAndUpdate({ _id: req.params.id }, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200);
    })
})

/*
 * DELETE /lists/:id
 * Purpose: Delete a list
 */
app.delete('/lists/:id', (req, res) => {
    List.findOneAndRemove({
        _id: req.params.id
    }).then((removeListDoc) => {
        res.sendStatus(removeListDoc);
    })
})

/*
 * GET /lists/:listId/tasks
 * Purpose: Get all tasks in a specific list
 */
app.get('/lists/:listId/tasks', (req, res) => {
    Task.find({
        _listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    })
})

/*
 * Get specific task by listId taskId 
 */
app.get('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOne({
        _id: req.params.taskId,
        _listId: req.params.listId
    }).then((task) => {
        res.send(task);
    })
})

/*
 * POST /lists/:listId/tasks
 * Purpose: Create a new task in a specific list
 */
app.post('/lists/:listId/tasks', (req, res) => {
    let newTask = new Task({
        title: req.body.title,
        _listId: req.params.listId
    });
    newTask.save().then((newTaskDoc) => {
        res.send(newTaskDoc);
    })
})

/**
 * PATCH /lists/:listId/tasks/:taskId
 * Purpose: Update an existing task
 */
app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndUpdate({
        _id: req.params.taskId,
        _listId: req.params.listId
    }, {
            $set: req.body
        }
    ).then(() => {
        res.send({message: 'Updated successfully'});
    })
})

/*
 * DELETE /lists/:listId/tasks/:taskId
 * Purpose: Delete a task
 */
app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndRemove({
        _id: req.params.taskId,
        _listId: req.params.listId
    }).then((removedTaskDoc) => {
        res.send(removedTaskDoc);
    });
});

/* USER ROUTES*/

/*
 * POST /users
 * Purpose: Sign up
 */
app.post('/users', (req, res) => {
    // User sign up
    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // Session created successfully - refreshToken returned,
        // şimdi kullanıcı için bir  access auth token oluşturuyoruz

        return newUser.generateAccessAuthToken().then((accessToken) => {
            // access auth token başarıyla oluşturuldu, şimdi auth tokensiçeren bir nesne döndürüyoruz
            return {accessToken, refreshToken} 
        });
    }).then((authTokens) => {
        // Headerdaki auth tokenları ve gövdedeki kullanıcı nesnesi ile kullanıcıya yanıtı oluşturup gönderiyoruz.
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    });
})

/*
 * POST /users/login
 * Purpose: Login
 */

app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session created successfully - refreshToken returned.
            // şimdi kullanıcı için bir  access auth token oluşturuyoruz

            return user.generateAccessAuthToken().then((accessToken) => {
                // access auth token generated successfully, şimdi auth tokens içeren bir nesne döndürüyoruz
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            // Headerdaki auth belirteçleri ve gövdedeki kullanıcı nesnesi ile kullanıcıya yanıtı oluşturup gönderiyoruz.
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
});


//TODO: bunu çalıştıramıyorum accesstoken dönmesi gerekiyor
/**
 * GET /users/me/access-token
 * Purpose: generates and returns an access token tr: bir erişim belirteci oluşturur ve döndürür
 */
app.get('/users/me/access-token', verifySession, (req, res) => {
    // user/caller kimliğinin doğrulandığını biliyoruz ve user_id ve user nesnesini kullanabiliriz
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.listen(3000, () => {
    console.log("Server listening on port 3000");
})