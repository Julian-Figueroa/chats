const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require("body-parser");
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(morgan('combined'));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/risk/:id', (req, res) => {
    const riskId = req.params.id;
    // console.log('Id: ', riskId);
    const queryString = 'SELECT * FROM riesgos WHERE idRiesgo = ?';

    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'chats'
    });

    connection.query(queryString, [riskId], (err, rows, fields) => {
        if (err) {
            console.log('There was an error fetching the data ', err);
            res.sendStatus(500);
            return;
        }
        console.log('Fetch Data ');

        const risk = rows.map((row) => {
            return {
                RiskName: row.nombre
            }
        });

        res.json(risk);
    });

});

app.post('/risk', (req, res) => {
    const riskName = req.body.riskName;
    console.log('riskName: ', riskName);
    const queryString = 'INSERT INTO riesgos SET nombre = ?';

    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'chats'
    });

    connection.query(queryString, [riskName], (err, results, fields) => {
        if (err) {
            console.log('There was an error saving the data', err);
            res.json({
                Message: err.sqlMessage
            });
            return;
        }
        connection.commit((err) => {
            if (err) {
                return connection.rollback(function () {
                    throw err;
                });
            }
            console.log('Insert Data ');
            res.json({
                Message: 'One Risk was added succesfully'
            });
        });
    });

});

app.get('/', (req, res) => {
    console.log('Root path');
    res.send('Hello From Path');
});

app.get('/risks', (req, res) => {
    const queryString = 'SELECT * FROM riesgos';

    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'chats'
    });

    connection.query(queryString, (err, rows, fields) => {
        if (err) {
            console.log('There was an error fetching the data ', err);
            res.sendStatus(500);
            return;
        }
        console.log('Fetch Data ');

        const risk = rows.map((row) => {
            return {
                RiskName: row.nombre
            }
        });

        res.json(risk);
    });
});

app.post('/register', async (req, res) => {
    const { name, lastName, password, email } = req.body;

    if (name && lastName && password && email) {
        await bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                console.log('There was an error encrpting the password ', err);
                res.sendStatus(500);
                return;
            } else {
                const queryString = 'INSERT INTO usuarios SET ?';
                const created = new Date();
                const user = {
                    nombre: name,
                    apellido: lastName,
                    password: hash,
                    correo: email,
                    fechaIngreso: created
                };
                const connection = mysql.createConnection({
                    host: 'localhost',
                    user: 'root',
                    database: 'chats'
                });

                connection.query(queryString, user, (err, results, fields) => {
                    if (err) {
                        console.log('There was an error saving the data', err);
                        res.json({
                            Message: err.sqlMessage
                        });
                        return;
                    }
                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(function () {
                                throw err;
                            });
                        }
                        console.log('Data Inserted!!! ');
                        res.json({
                            Message: 'One User was added succesfully'
                        });
                    });
                });
            }
        });
    } else {
        res.sendStatus(500);
        return;
    }

});

app.post('/login', (req, res) => {
    const { password, email } = req.body;
    // console.log('Login: ', password, email);
    if (password && email) {
        const queryString = 'SELECT * FROM usuarios WHERE correo = ?';
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            database: 'chats'
        });

        connection.query(queryString, [email], (err, rows, fields) => {
            if (err) {
                console.log('The user is wrong, please check it', err);
                res.sendStatus(500);
                return;
            }

            const pass2 = rows[0].password;

            bcrypt.compare(password, pass2, (err, result) => {
                if (err) {
                    console.log('There was an error saving the data', err);
                    res.sendStatus(500);
                    res.json({
                        Message: 'There was an error with the credentials'
                    });
                    return;
                }
                else if (result === true) {
                    
                    res.json({
                        Message: 'The User is Authenticated !!!'
                    });
                } else {
                    res.json({
                        Message: 'The User could not be Authenticated !!!'
                    });
                    return;
                }
            });
        });
    }
});

app.get('/users', (req, res) => {
    const user1 = {
        firstName: 'Michael Jordan'
    };
    const user2 = {
        firstName: 'Michael Platini'
    };
    console.log('Root path');

    res.json([user1, user2]);
});

app.listen(3030, () => {
    console.log('Server App and Running in port 3030');
});


