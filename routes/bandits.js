const express = require("express")
const connection = require("../db-config");
const router = express.Router()
const Joi = require('joi');


router.get("/", (req, res) => {
    let sql = "SELECT b.*, group_concat(DISTINCT a.name_arme SEPARATOR ', ') as armes FROM bandits as b JOIN bandits_has_armes as bha ON bha.bandits_idbandits = b.idbandits JOIN armes as a ON a.idarmes = bha.armes_idarmes GROUP BY b.idbandits";
    connection.query(sql, (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error retrieving bandits from database");
        } else {
          res.json(result);
        }
      });
    });


    router.get("/:id", (req, res) => {
        const banditsId = req.params.id;
        connection.query(
          "SELECT b.*, group_concat(DISTINCT a.name_arme SEPARATOR ', ') as armes FROM bandits as b JOIN bandits_has_armes as bha ON bha.bandits_idbandits = b.idbandits JOIN armes as a ON a.idarmes = bha.armes_idarmes WHERE idbandits = ?",
          [banditsId],
          (err, result) => {
            if (err) {
              console.error(err);
              res.status(500).send("Error retrieving bandits from database");
            } else if (result.length === 0) {
              res.status(404).send("Bandits not found");
            } else {
              res.json(result[0]);
            }
          }
        );
      });
    
router.get("/:id", (req, res) => {
    console.log("bonjour")
    // const { id } = req.params
	// res.status(200).json(`je suis dans le /${id}`)
})


router.post('/', (req, res) => {
    const db = connection.promise();
    const { name, surname, age, prime, description, crimes, dead, alive, deadoralive, status, image, voix, ville, latitude, longitude, rating } = req.body
    let validationErrors = null;
    db.query('SELECT * FROM bandits WHERE name = ?', [name])
      .then(([result]) => {
        if (result[0]) return Promise.reject('DUPLICATE_NAME');
        validationErrors = Joi.object({
            name: Joi.string().max(255).required(),
            surname: Joi.string().max(45).allow(null).optional(),
            age:Joi.number().optional(),
            prime: Joi.number().required().max(1000000000000),
            description:Joi.string().max(255).allow(null).optional(),
            crimes: Joi.string().max(255).required(),
            dead:Joi.bool().required(), 
            alive: Joi.bool().required(), 
            deadoralive: Joi.bool().required(), 
            status: Joi.bool().required(),
            image: Joi.string().max(255).required(),
            voix: Joi.string().max(255).allow(null).optional(),
            ville: Joi.string().max(255),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            rating: Joi.bool().required(),
        }).validate(req.body, { abortEarly: false }).error;
        if (validationErrors) return Promise.reject('INVALID_DATA');
        return db.query('INSERT INTO bandits (name, surname, age, prime, description, crimes, dead, alive, deadoralive, status, image, voix, ville, latitude, longitude, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ', [name, surname, age, prime, description, crimes, dead, alive, deadoralive, status, image, voix, ville, latitude, longitude, rating]);
      })
      .then(([{ insertId }]) => {
        res.status(201).json({ id: insertId, ...req.body });
      })
      .catch((err) => {
        console.error(err);
        if (err === 'DUPLICATE_NAME')
          res.status(409).json({ message: 'This name is already used' });
        else if (err === 'INVALID_DATA')
          res.status(422).json({ validationErrors });
        else res.status(500).send('Error saving the name');
      });
  });




module.exports = router