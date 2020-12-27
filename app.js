const express = require('express')   //framework
const hbs = require('hbs')
var MongoClient = require('mongodb').MongoClient;
var Regex = require("regex");


hbs.registerHelper('selected', (option,value)=>{
    if (option == value){
        return 'selected';
    }
    else {
        return '';
    }
})

// ten cua no la selected va no co 2 time so la option va value 
/*
mua dich cua helper nay la de so sanh gia tri cua option va value
option se la value cua option, value la gia tri dc luu tru tren db cua san pham

neu option = value thi <option> se co thuoc tinh selected
*/

const app = express();
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials')

var bodyParser = require("body-parser");     //mot doi tuong body chua du lieu ma da duoc phan tich cu pham se duoc dua vao request. du lieu do la cap key-value, trong do co the la true, array, string neeu extended false, cac loai con lai la true
app.use(bodyParser.urlencoded({ extended: false }));

var url = 'mongodb+srv://anhvu123:anhvu123@cluster0.e6pnm.mongodb.net/test'

app.get('/', async(req, res) => {    //async khai bao ham bat dong bo - await tam dung ham bat dong bo
    let client = await MongoClient.connect(url);
    let dbo = client.db("ASM2");
    let result = await dbo.collection("products").find({}).toArray();
    res.render('index', { model: result })
})
app.get('/insert', (req, res) => {
    res.render('newProduct');
})
app.post('/doInsert', async(req, res) => {
    let nameInput = req.body.txtName;
    let priceInput = req.body.txtPrice;
    let ageInput = req.body.txtAge;

    let client = await MongoClient.connect(url);
    let dbo = client.db("ASM2");
    let newProduct = { productName: nameInput, price: priceInput, AgeRange : ageInput };
    await dbo.collection("products").insertOne(newProduct)

    res.redirect('/');
})
app.get('/search', (req, res) => {
    res.render('search');
})
app.post('/doSearch', async(req, res) => {
    let nameInput = req.body.txtName;
    let client = await MongoClient.connect(url);
    let dbo = client.db("ASM2");
    let result = await dbo.collection("products").find({ productName: { $regex: nameInput } }).toArray();
    res.render('search', { model: result })
})
app.get('/delete', async (req,res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};

    let client = await MongoClient.connect(url);
    let dbo = client.db("ASM2");
    await dbo.collection('products').deleteOne(condition)
    res.redirect('/');
})
app.get('/Edit', async (req,res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;

    let client = await MongoClient.connect(url);
    let dbo = client.db("ASM2");
    let result = await dbo.collection("products").findOne({"_id" : ObjectID(id)});
    res.render('editSanPham', {model:result});
})
app.post('/doEdit', async(req,res)=>{
    let id = req.body.id;
    let name = req.body.txtName;
    let priceInput = req.body.txtPrice;
    let Age = req.body.txtAge;
    let newValues = {$set : {productName: name, price:priceInput, AgeRange:Age}};
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};

    let client = await MongoClient.connect(url);
    let dbo = client.db("ASM2");
    await dbo.collection("products").updateOne(condition, newValues);
    
    res.redirect('/');

})
var PORT = process.env.PORT || 3000
app.listen(PORT)
console.log("server is running")
