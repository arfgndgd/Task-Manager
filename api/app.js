const express = require('express');
const app = express();
const { mongoose } = require('./db/mongoose');
const bodyParser = require('body-parser');
// Load in the mongoose models
const { List, Task } = require('./db/models');

// Load middleware
app.use(bodyParser.json());

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
})

/*
 * DELETE /lists/:id
 * Purpose: Delete a list
 */
app.delete('/lists/:id', (req, res) => {
})

app.listen(3000, () => {
    console.log("Server listening o port 3000");
})