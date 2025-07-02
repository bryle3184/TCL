
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const app = express()

dotenv.config()

const mongurl = process.env.MONGO_URL

mongoose.connect(mongurl).then(()=>{console.log('Database Connected!')})

//accounts
const schema1 = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    birthday: String
})

const model1 = mongoose.model('accounts', schema1)

//to-do list
const schema2 = new mongoose.Schema({
    task: String,
    deadline: Date
})

const model2 = mongoose.model('todo', schema2)



app.use(express.static('./src'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.post('/', async(req, res)=>{
    const {username, password} = req.body
    usernames = username
    passwords = password
    const data = await model1.findOne({username: usernames, password: passwords})
    console.log(username, password)

    if(data){
        console.log(data)
        return res.redirect('/TCL_index.html')
    }
    return
})

app.post('/sign-up_TCL.html', async(req, res)=>{
    const {name, username, birthday, password} = req.body
    names = name
    usernames = username
    birthdays = birthday
    passwords = password
    const data = await model1.insertOne({name: names, username: usernames, birthday: birthdays, password: passwords})

    console.log(data)
    res.redirect('/index.html')
})

app.listen(5000, () => {
    console.log('Server Ready! port:5000')
})










