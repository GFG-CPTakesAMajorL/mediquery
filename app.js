require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const hospitalUser = require('./schemas/hospitalUser');
const medicalShopUser = require('./schemas/medicalShopUser');
const {hospitalAuth} = require('./middlewares/hospitalAuth');
const {medicalShopAuth} = require('./middlewares/medicalShopAuth');
const hospitalData = require('./schemas/hospitalData');
const medicalShopData = require('./schemas/medicalShopData');
const salt = 10;


const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.set('view engine', 'ejs')

mongoose.connect( process.env.DB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}, (e)=>{
    if(e){
        console.log(e);
        return;
    }
    console.log("DB connected");
})

app.get('/',(req, res)=> {
    res.render('index')
})

app.post('/hospital/signup', (req, res) => {
    const newHospital = new hospitalUser(req.body);
    hospitalUser.findOne({email: newHospital.email}, function(err, user){
        if(user)
        return res.status(400).json({auth: 'false', message: 'email already exist'})
        newHospital.save();
        res.send("hospital saved");
    })
})

app.post('/medicalshop/signup', (req, res) => {
    const newMedicalShop = new medicalShopUser(req.body);
    medicalShopUser.findOne({email: newMedicalShop.email}, function(err, user){
        if(user)
        return res.status(400).json({auth: 'false', message: 'email already exist'})
        newMedicalShop.save();
        res.send("medical shop saved")
    })
})

app.get('/hospital/login', (req, res) => {
    console.log(req.cookies);
    token = req.cookies.auth;
    hospitalUser.findOne(token, (err, user) => {
        console.log(user);
        console.log(token);
        if(user) return res.send("you are already logged in");
        else{
            hospitalUser.findOne( {'email': req.body.email}, (err, user) => {
                if(!user)
                return res.json({isAuth : false, message : ' Auth failed ,email not found'});
                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});
        
                    user.generateToken((err,user)=>{
                        if(err) return res.status(400).send(err);
                        res.cookie('auth',user.token).json({
                            isAuth : true,
                            id : user._id,
                            email : user.email
                        });
                    });
                });
            })
        }
    })
})

app.post('/addhospitaldata', (req, res) => {
    const newHospitalData = new hospitalData(req.body);
    newHospitalData.save();
    res.send('Hospital Data Added');
})

app.post('/addmedicalshopdata', (req, res) => {
    const newMedicalShopData = new medicalShopData(req.body);
    newMedicalShopData.save();
    res.send('Medical Shop Data Added');
})

const PORT =  process.env.PORT || 3000
app.listen(PORT, ()=>{
    console.log("Server Started.")
});


