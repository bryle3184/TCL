
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const multer = require('multer')
const upload = require('../TCL PROJECT/middleware/upload')

const app = express()
let user
let roles

dotenv.config()

const mongurl = process.env.MONGO_URL

mongoose.connect(mongurl).then(()=>{console.log('Database Connected!')})

app.use(express.static('./src'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use('/uploads', express.static('uploads'))

//accounts
const schema1 = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    birthday: String,
    role: String
})

const model1 = mongoose.model('accounts', schema1)

app.post('/', async(req, res)=>{
    const {username, password} = req.body
    const data = await model1.findOne({username: username, password: password})
    console.log(username, password)
    console.log(data)
    user = data.name

    if(data){
        console.log(data)
        roles = data.role
        return res.redirect('/TCL_index.html')
    }
    return
})

app.post('/sign-up_TCL.html', async(req, res)=>{
    const {name, username, birthday, password, role} = req.body

    const data = await model1.insertOne({name: name, username: username, birthday: birthday, password: password, role:role})

    console.log(data)
    res.redirect('/index.html')
})

//to-do list
const schema2 = new mongoose.Schema({
    task: String,
    deadline: Date,
    live: String,
    note: String,
    assigned: String,
    role: String
})

const model2 = mongoose.model('todos', schema2)

app.get('/api/TCL_index.html', async(req, res)=>{
    const data = await model2.find()

    res.json(data)
})

app.post('/insert_task/TCL.html', async(req, res)=>{
    const {task, deadline, live, note, assigned} = req.body

    const find = await model2.find({task:task})

    if(find.length != 0){
        res.redirect('/TCL_index.html')

        return
    }
    
    const data = await model2.insertOne({task:task, deadline:deadline, live:live, note:note, assigned:assigned})
    console.log(data)
    res.redirect('/TCL_index.html')
})

app.post('/api/update_task/TCL.html', async(req, res)=>{
    console.log('received: ', req.body)
    const {task, deadline, note, assigned} = req.body

    const data = await model2.updateOne({task: task.slice(9)}, {$set:{deadline: deadline, note:note, assigned:assigned}})
    console.log(data)
    res.redirect('/TCL_index.html')
})

app.get('/api/personal', async(req, res) => {
    console.log(roles)
    const data = await model2.find({assigned:roles})

    console.log(data)
    res.json(data)
})

//task-archives
const schema3 = new mongoose.Schema({
    task: String,
    date: Date,
    live: String,
    status: String,
    note: String,
    assigned: String
})

const model3 = mongoose.model('task_archives', schema3)

app.post('/api/done_task/TCL.html', async(req, res)=>{
    console.log('received: '+ req.body)
    const {task, status, date, note, assigned} = req.body

    const data = await model3.insertOne({task: task.slice(9), status: status, date: date, note:note, assigned:assigned})
    console.log(data)

    const data1 = await model2.deleteOne({task:task.slice(9)})
    console.log(data1)
    res.redirect('/TCL_index.html')

})

app.post('/api/delete_task/TCL.html', async(req, res)=>{
    console.log('received: '+ req.body)
    const {task, status, date, note, assigned} = req.body

    const data = await model3.insertOne({task: task.slice(9), status: status, date: date, note:note, assigned:assigned})
    console.log(data)

    const data1 = await model2.deleteOne({task:task.slice(9)})
    console.log(data1)
    res.redirect('/TCL_index.html')
})

app.post('/api/restore_archive/TCL.html', async(req, res)=>{
    console.log('received: '+ req.body)
    const {task, date, note, assigned} = req.body

    const data = await model2.insertOne({task: task, deadline: date, note:note, assigned:assigned})
    console.log(data)

    const data1 = await model3.deleteOne({task:task})
    console.log(data1)
    res.redirect('/TCL_index.html')
})

app.get('/api/archive/TCL.html', async(req, res)=>{
    const data = await model3.find()

    res.json(data)
})

app.post('/api/delete_archive/TCL.html', async(req, res)=>{
    console.log('received: '+ req.body)
    const {task} = req.body

    const data = await model3.deleteOne({task:task})
    console.log(data)
    res.redirect('/TCL_index.html')
})

//live calendar
const schema4 = new mongoose.Schema({
    date:{
        type: [Array],
        default: undefined
    }
})

const model4 = mongoose.model('live_calendars', schema4)

app.get('/api/get_calendar', async(req, res) => {
    const data = await model4.find()

    res.json(data)
})

app.post('/api/live_calendar', async(req, res)=>{
    const {date} = req.body

    await model4.deleteMany()
    const data = await model4.insertOne({date:date})
    res.redirect('/TCLcalendar.html')
})

//creative asset tracker
const schema5 = new mongoose.Schema({
    campaign: String,
    platform: String,
    status: String,
    file: String,
    link: String
})

const model5 = mongoose.model('creative_assets', schema5)

app.get('/api/getCreativeAssets', async(req, res) => {
    const data = await model5.find()

    console.log(data)

    res.json(data)
})

app.post('/api/updateCreativeAssets',async(req, res)=>{
    console.log('received: ', req.body)
    const {id, status} = req.body

    const data = await model5.updateOne({_id:id}, {$set:{status:status}})
    res.redirect('/TCL_creative.html')
})

app.post('/api/insertCreativeAssets', upload.single('files'), async(req, res)=>{
    const {
        campaign,
        platform,
        status,
        file, 
        link
    } = req.body

    const data = await model5.insertOne({
        campaign: campaign,
        platform: platform,
        status: status,
        file: file, 
        link: req.file.path
    })
    console.log(data)
    res.redirect('/TCL_creative.html')
})

app.post('/api/deleteCreativeAssets', async(req, res)=>{
    console.log('received: '+ req.body)
    const {id} = req.body

    const data = await model5.deleteOne({_id:id})
    console.log(data)
    res.redirect('/TCL_craetive.html')
})

//payout tracker
const schema6 = new mongoose.Schema({
    name: String,
    campaign: String,
    date: String,
    status: String,
    link: String
})

const model6 = mongoose.model('payouts', schema6)

app.get('/api/payout.html', async(req, res) => {
    const data = await model6.find()

    console.log(data)

    res.json(data)
})

app.post('/update/payout.html', async(req, res)=>{
    console.log('received: ', req.body)
    const {id, status} = req.body

    const data = await model6.updateOne({_id:id}, {$set:{status:status}})
    console.log(data)
    res.redirect('/TCLpayout.html')
})

app.post('/delete/payout.html', async(req, res)=>{
    console.log('received: '+ req.body)
    const {id} = req.body

    const data = await model6.deleteOne({_id:id})
    console.log(data)
    res.redirect('/TCLpayout.html')
})

app.post('/insert/payout.html', async(req, res)=>{
    const {name, campaign, date, status, link} = req.body

    const data = await model6.insertOne({
        name: name,
        campaign: campaign,
        date: date,
        status: status,
        link: link
    })
    console.log(data)
    res.redirect('/TCLpayout.html')
})

//customer service
const schema7 = new mongoose.Schema({
    customer: String,
    concern: String,
    date: String,
    status: String,
    chatlink: String
})

const model7 = mongoose.model('customer_services', schema7)

app.get('/api/customers.html', async(req, res)=>{
    const data = await model7.find()

    console.log(data)

    res.json(data)
})

app.post('/api/insert_concern', async(req, res)=>{
    const {customer, concern, date, status, chatlink} = req.body

    const data = await model7.insertOne({customer:customer, concern:concern, date:date, status:status, chatlink:chatlink })
    console.log(data)
    res.redirect('/TCLcsr.html')
})

app.post('/api/update_concern', async(req, res)=>{
    const {id ,customer, concern, date, status} = req.body

    const data = await model7.updateOne({_id:id}, {$set:{status:status}})
    console.log(data)
    res.redirect('/TCLcsr.html')
})

app.post('/api/delete_concern', async(req, res)=>{
    console.log('received: '+ req.body)
    const {id} = req.body

    const data = await model7.deleteOne({_id:id})
    console.log(data)
    res.redirect('/TCLcsr.html')
})

const schema8 = new mongoose.Schema({
    id: String,
    schedule: String,
    account: String,
    platform: String,
    event: String,
    visual: String,
    header: String,
    subheader: String,
    caption: String,
    hashtags: String,
    creatives: String,
    campaign: String,
    notes: String,
    status: String,
    archive: String,
    file: String
})

const model8 = mongoose.model('digital_marketings', schema8)

let names

app.get('/get/digital_marketings', async(req, res) => {
    const data = await model8.find({archive:names})

    console.log(data)

    res.json(data)
})

app.post('/create/digital_marketings',async(req, res)=>{
    const {id,schedule,account,platform,event,visual,header,subheader,caption,hashtags,creatives,campaign,notes,status, archive, file} = req.body

    const data = await model8.insertOne({
        id: id,
        schedule: schedule,
        account: account,
        platform: platform,
        event: event,
        visual: visual,
        header: header,
        subheader: subheader,
        caption: caption,
        hashtags: hashtags,
        creatives: creatives,
        campaign: campaign,
        notes: notes,
        status: status,
        archive: archive,
        file: ''
    })
    console.log(data)
    res.redirect('/digitalmarket.html')
})

app.post('/updates1/digital_marketings', upload.single('files'),async(req, res)=>{
    const {id,schedule,account,platform,event,visual,header,subheader,caption,hashtags,creatives,campaign,notes,status,archive,file} = req.body

    const data = await model8.updateOne({id:id}, {$set:{
        schedule: schedule,
        account: account,
        platform: platform,
        event: event,
        visual: visual,
        header: header,
        subheader: subheader,
        caption: caption,
        hashtags: hashtags,
        creatives: creatives,
        campaign: campaign,
        notes: notes,
        status: status,
        archive: archive,
        file: req.file.path
    }})

    res.redirect('/digitalmarket.html')
})

app.post('/update/digital_marketings',async(req, res)=>{
    const {id,schedule,account,platform,event,visual,header,subheader,caption,hashtags,creatives,campaign,notes,status,archive,file} = req.body

    const data = await model8.updateOne({id:id}, {$set:{
        schedule: schedule,
        account: account,
        platform: platform,
        event: event,
        visual: visual,
        header: header,
        subheader: subheader,
        caption: caption,
        hashtags: hashtags,
        creatives: creatives,
        campaign: campaign,
        notes: notes,
        status: status,
        archive: archive,
        file: file
    }})

    res.redirect('/digitalmarket.html')
})

app.post('/delete/digitalmarket.html', async(req, res)=>{
    console.log('received: '+ req.body)
    const {deletes} = req.body

    const data = await model8.deleteOne({id:deletes})
    console.log(data)
    res.redirect('/digitalmarket.html')
})

const schema81 = new mongoose.Schema({
    name: String
})

const model81 = new mongoose.model('digitalMarketArchives', schema81)

app.post('/delete/digitalMarketArchives', async(req, res)=>{
    console.log('received: '+ req.body)
    const {id, name} = req.body

    await model8.deleteMany({archive:name})
    await model81.deleteOne({_id:id})

    res.redirect('/digitalmarket.html')
})

app.post('/digitalMarketArchives', async(req, res)=>{
    names = '' 
    const {name} = req.body

    names = name

    res.redirect('/digitalmarket.html')
})

app.get('/get/digitalMarketArchives', async(req, res)=>{
    const data = await model81.find()

    console.log(data)

    res.json(data)
})

app.post('/insert/digitalMarketArchives', async(req, res)=>{
    const {name} = req.body

    const data = await model81.insertOne({name:name})
    console.log(data)
    res.redirect('/digitalmarket.html')
})

const schema9 = new mongoose.Schema({
    date: {
        type: [Array],
        default: undefined
    }
})

const model9 = mongoose.model('leave_calendars', schema9)

app.get('/api/get_leave', async(req, res) => {
    const data = await model9.find()

    res.json(data)
})

app.post('/api/leave_calendar', async(req, res)=>{
    const {date} = req.body

    await model9.deleteMany()
    const data = await model9.insertOne({date:date})
    res.redirect('/TCLcalendar.html')
})

const schema10 = new mongoose.Schema({
    campaign: String,
    date: String,
    budget: Number,
    link: String,
    notes: String,
})

const model10 = mongoose.model('campaigns', schema10)

app.get('/api/getCampaigns', async(req, res) => {
    const data = await model10.find()

    console.log(data)

    res.json(data)
})

app.post('/api/insertCampaign', async(req, res)=>{
    const {campaign, budget, link, notes, date} = req.body

    const data = await model10.insertOne({
        campaign: campaign,
        date: date,
        budget: budget,
        link: link,
        notes: notes
    })
    console.log(data)
    res.redirect('/digitalmarket.html')
})

app.post('/api/deleteCampaign', async(req, res)=>{
    console.log('received: '+ req.body)
    const {} = req.body

    const data = await model10.deleteOne({})
    console.log(data)
    res.redirect('digitalmarket.html')
})

//---------------------------------------------------------------------------------------------------------------

app.get('/current_user', async(req, res) => {
    let data = {
        current_user: user
    }

    res.json(data)
})

app.listen(5000, () => {
    console.log('Server Ready! port:5000')
})










