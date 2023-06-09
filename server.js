if(process.env.NODE_ENV !== 'production')
{
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const path = require('path')


//const passport = require('passport')
const initializePassport = require('./passport-config')
const methodOverride = require('method-override')
initializePassport(passport,
email => users.find(user => user.email === email),
id => users.find(user=> user.id === id)
)


const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// app.use(express.static(__dirname + '/public'));
//  <link rel="stylesheet" type="text/css" href="public/style.css"></link>
app.use(express.static('/public'))


app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs',{name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated,  passport.authenticate('local',
{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: true
}
))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try{
 const hashedPassword = await bcrypt.hash(req.body.password, 10)
 users.push({
    id : Date.now().toString(),
    email : req.body.email,
    password : hashedPassword
 })
 res.redirect('/login')

    }catch{
        res.redirect('/register')

    }
 console.log(users)
})


app.delete('/logout', (req, res,next) => {
    req.logOut(req.user, function(err){
        return next(err)
       // alert("logout not possible")
    })
    res.redirect('/login')
})


function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')

}


function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
       return res.redirect('/')
    }
    next()
}

app.listen(3000)