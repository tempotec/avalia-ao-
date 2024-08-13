const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

// Configuração do app
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'sua_chave_secreta', resave: false, saveUninitialized: true }));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do Sequelize para o SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'evaluation.db'
});

// Modelo de Evaluation
const Evaluation = sequelize.define('Evaluation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cleanliness: {
        type: DataTypes.INTEGER
    },
    organization: {
        type: DataTypes.INTEGER
    },
    presentation: {
        type: DataTypes.INTEGER
    },
    food_quality: {
        type: DataTypes.INTEGER
    },
    comments: {
        type: DataTypes.STRING(500)
    }
});

// Função para gerar um nome aleatório
function gerarNomeAleatorio() {
    const nomes = [
        "GreenLeaf", "VibePositive", "EcoFriendly", "PeaceLover",
        "HerbGarden", "PlantPower", "NatureSpirit", "ZenSpace",
        "EcoWarrior", "GreenBliss", "CannaCulture", "VeganVibes",
        "LeafyGreen", "ChillZone", "HighSpirits", "BotanicalBliss"
    ];
    return nomes[Math.floor(Math.random() * nomes.length)];
}

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Rota para submissão de avaliações
app.post('/submit_evaluation', async (req, res) => {
    const sections = ['casa_verde', 'jerimum'];

    for (let section of sections) {
        let company = req.body[`company_${section}`] || gerarNomeAleatorio();
        let cleanliness = parseInt(req.body[`cleanliness_${section}`]) || 0;
        let organization = parseInt(req.body[`organization_${section}`]) || 0;
        let presentation = parseInt(req.body[`presentation_${section}`]) || 0;
        let food_quality = parseInt(req.body[`food_quality_${section}`]) || 0;
        let comments = req.body[`comments_${section}`] || '';

        console.log(`Received data for ${company} - Cleanliness: ${cleanliness}, Organization: ${organization}, Presentation: ${presentation}, Food Quality: ${food_quality}, Comments: ${comments}`);

        try {
            await Evaluation.create({
                company,
                cleanliness,
                organization,
                presentation,
                food_quality,
                comments
            });
        } catch (err) {
            console.error(err);
        }
    }

    req.flash('success', 'Obrigado, avaliação enviada!');
    res.redirect('/');
});

// Rota para página de avaliação
app.get('/evaluate/:company', (req, res) => {
    res.render('evaluate.html', { company: req.params.company });
});

// Rota para exibir avaliações no admin
app.get('/admin/evaluations', async (req, res) => {
    try {
        const evaluations = await Evaluation.findAll();
        res.render('admin_evaluations.html', { evaluations });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar avaliações.');
    }
});

// Sincronizar banco de dados e iniciar o servidor
sequelize.sync({ force: true }).then(() => {
    app.listen(3000, () => {
        console.log('Servidor rodando na porta 3000');
    });
});
