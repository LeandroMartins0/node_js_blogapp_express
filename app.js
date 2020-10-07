// Carregamento de módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require("./routes/admin")
    const path = require("path")
    const mongoose = require('mongoose')
    //const { urlencoded } = require('body-parser')
    const urlencodedParse = bodyParser.urlencoded({extended:false}); 
    const session = require("express-session")
    const flash = require("connect-flash")
    const moment = require('moment')
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")
    const passport = require("passport")
    require("./config/auth")(passport)
    const db = require("./config/db")
// Configurações 
    // Sessão 
        app.use(session({
            secret: "123456",
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    // Midlleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("erro_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null;
            next()
        })
    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({
            defaultLayout: 'main',
            helpers: {
                formatDate: (date) => {
                    return moment(date).format('DD/MM/YYYY')
                }
            }
        }))
        app.set('view engine', 'handlebars');
    // Mongoose
    // conexao local
        mongoose.connect('mongodb://localhost/blogapp',{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}).then(() => {
            console.log("Conectado ao MongoDB")
        }).catch((err) => {
            console.log("Erro ao se conectar: " + err)
        })
        // mongoose.Promise = global.Promise;
        // mongoose.connect(db.mongoURI).then(() => {
        //     console.log("Conectado ao MongoDB")
        // }).catch((err) => {
        //     console.log("Erro ao se conectar: " + err)
        // })
    // Public (arquivos estáticos) 
        app.use(express.static(path.join(__dirname, "public")))
// Rotas
    app.get('/', (req,res) => {
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Jouve um erro interno")
            res.redirect("/404")
        })
    })

    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else {
                req.flash("error_msg", "Está postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao listar as categorias")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria) {

                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar os posts")
                    res.redirect("/")
                })

            }else {
                req.flash("error_msg", "Está categoria não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
            res.redirect("/")
        })
    })

    
    app.get('/404', (req, res) => {
        res.send('Erro 404!')
    })
    
    app.use("/admin", admin);
    app.use("/usuarios", usuarios)

// Outros
//  CRIA PORTA SEM HEROKU
const PORT = 8081
app.listen(8081,() => {
    console.log("Servidor rodando! ")
})

// const PORT = process.env.PORT || 8089
// app.listen(PORT, () => {
//     console.log("Servidor rodando...")
// })