// Validação de dados enviados pelo formulário

    var verifica = function validaCampos(dados){
        var erros = []

        if(!dados.nome || typeof dados.nome == undefined || dados.nome == null){
            erros.push({
                texto: "Nome inválido"
            })
        }

        // if(dados.nome.lenght <2){
        //     erros.push({
        //         texto: "Nome da categoria é muito pequeno"
        //     })
        // }

        if(dados.nome.length < 2){
            erros.push({
                texto: "Nome da categoria é muito pequeno"
            })
        }

        if(!dados.slug || typeof dados.slug == undefined || dados.slug == null){
            erros.push({
                texto: "Slug inválido"
            })
        }

        // Retorna quantidade de erros
        return erros;
    }

    module.exports = verifica;