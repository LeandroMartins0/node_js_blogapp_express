const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
const validaCampos = require("../control/validaCampos.js")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")


router.get('/', eAdmin,  (req, res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req, res) => {
    res.send("Página de posts")
})

router.get('/categorias', eAdmin,  (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias => {
        res.render("./admin/categorias", {categorias: categorias.map(categorias => categorias.toJSON())})
    })).catch(() => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

router.get('/categorias/add', eAdmin,  (req, res) => {
    res.render("admin/addcategorias")
})

router.post('/categorias/nova', eAdmin,  (req, res) => {

    var erros = validaCampos(req.body)

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
            res.redirect("/admin")
        })
    }   
})

router.get("/categorias/edit/:id", eAdmin,  (req, res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg", "Está categoria não existe!")
        req.redirect("/admin/categorias")
    })
    
})

router.post('/categorias/edit', eAdmin,  (req, res) => {

    var erros = validaCampos(req.body)
    if(erros.length > 0){
        res.render("admin/editcategorias", {erros: erros})
    }else{     
        let filter = { _id: req.body.id }
        let update = { nome: req.body.nome, slug: req.body.slug }

        Categoria.findOneAndUpdate({_id: req.body.id}, {nome: req.body.nome, slug: req.body.slug}).then(() => {
            req.flash("success_msg", "Categoria atualizada")
            res.redirect('/admin/categorias')
        }).catch(err => {
            req.flash("error_msg", "Erro ao atualizar categoria")
        })
    }
})

router.get('/postagens', eAdmin,  (req, res) => {
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
              res.render('./admin/postagens', {postagens: postagens});

    }).catch( (err) => {

        req.flash('error_msg', 'Erro ao listar os posts')
        res.redirect('/admin')

    })
    

})

router.get("/postagens/add", eAdmin,  (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })
})

router.post("/categorias/deletar", eAdmin,  (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})

router.post("/postagens/nova", eAdmin,  (req, res) => {

    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida! Registre uma categoria"})
    }

    if(erros.length > 0){
        res.render("admin/addpostagem", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
            res.redirect("/admin/postagens")
        })
    }
})


router.get("/postagens/edit/:id", eAdmin,  (req, res) => {

    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })    
})

router.post("/postagem/edit", eAdmin,  (req, res) => {

    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("errro_msg", "Erro interno")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })

})

router.post("/postagens/deletar", eAdmin,  (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/admin/postagens")
    })
})

// router.post("/categorias/deletar", (req, res) => {
//     Categoria.deleteOne({_id: req.body.id}).then(() => {
//         req.flash("success_msg", "Categoria deletada com sucesso!")
//         res.redirect("/admin/categorias")
//     }).catch((err) => {
//         req.flash("error_msg", "Houve um erro ao deletar a categoria")
//         res.redirect("/admin/categorias")
//     })
// })


module.exports = router