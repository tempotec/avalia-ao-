const { Sequelize, DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');

// Configuração do Sequelize para o SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'evaluation.db'
});

// Definição do modelo Evaluation
class Evaluation extends Model {}
Evaluation.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    evaluator_name: {
        type: DataTypes.STRING,
        defaultValue: 'Convidado'
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
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    food_quality: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    comments: {
        type: DataTypes.STRING(500)
    }
}, {
    sequelize,
    modelName: 'Evaluation'
});

// Definição do modelo User
class User extends Model {
    async checkPassword(password) {
        return await bcrypt.compare(password, this.password_hash);
    }
}
User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'User'
});

// Função para gerar hash de senha
async function generatePasswordHash(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Sincronizar o banco de dados
sequelize.sync({ force: true }).then(async () => {
    // Exemplo de criação de um usuário com senha hash
    const passwordHash = await generatePasswordHash('minhaSenhaSegura');
    await User.create({
        username: 'usuario1',
        password_hash: passwordHash,
        is_admin: true
    });

    console.log('Banco de dados sincronizado e exemplo de usuário criado.');
});

module.exports = { Evaluation, User, sequelize };
