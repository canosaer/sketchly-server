const express = require('express')
const cors = require('cors')
const app = express()

require('dotenv').config()

const mongoose = require('mongoose')

const GameModel = require('./models/Games')
const PhraseModel = require('./models/Phrases')
const ImagesModel = require('./models/Images')

mongoose.connect(process.env.DATABASE, {useNewUrlParser: true})


const port = process.env.PORT || 1337

app.use(express.static('sketchly-client'))
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/favicon.ico', (req, res) => {
  res.send('Hello World!')
})

app.post('/games', async (req, res) => {

  let game = new GameModel({
    name: req.body.name,
    nameLower: req.body.name.toLowerCase(),
    turn: 1,
    active: false,
    lastUpdated: Date.now(),
  })
  if (req.body.password) game.password = req.body.password

  await game.save()

  res.send(`${game.name} created`)
  
})

app.post('/phrases', async (req, res) => {

  // let phrase = new PhraseModel({
  //   content: "A boy and a girl sitting on a bench",
  //   available: true,
  // })

  // await phrase.save()

  // res.send(`${phrase.content} added`)
  
})

app.post('/images/:game', async (req, res) => {

  let imageSet = new ImagesModel({
    game: req.params.game,
    images: [req.body.image,],
  })

  await imageSet.save()

  res.send(`success`)

})


app.patch('/games/:name', async (req, res) => {

  if(req.body.action === 'UPDATE_ACCESS'){
    GameModel.findOne({nameLower: req.params.name.toLowerCase()}, (err, game) => {
      if (err) {
        res.send(err)
      } else {
        game.accessedBy.push(req.body.userID)
        game.lastUpdated = Date.now()
        game.save()
      }
    })
  
    GameModel.findOneAndUpdate({name: req.params.name}, { $push: { accessedBy: req.body.userID } })
    res.send('access updated')
  }
  else if(req.body.action === 'DEACTIVATE'){
    GameModel.findOne({nameLower: req.params.name.toLowerCase()}, (err, game) => {
      if (err) {
        res.send(err)
      } else {
        const currentTurn = game.turn
        game.active = false
        setTimeout(() => {
          if(!game.active && game.turn === currentTurn) game.active = true
        }, "600000")
        game.save()
        res.send('success')
      }
    })
  }
  else if(req.body.action === 'REACTIVATE'){
    GameModel.findOne({nameLower: req.params.name.toLowerCase()}, (err, game) => {
      if (err) {
        res.send(err)
      } else {
        game.active = true
        game.save()
        res.send('success')
      }
    })
  }
  else if(req.body.mode === 'draw' || req.body.mode === 'label'){
    GameModel.findOne({nameLower: req.params.name.toLowerCase()}, (err, game) => {
      if (err) {
        res.send(err)
      } else {
        if(!game.active){
          game.contributorNames.push(req.body.userName)
          if(game.turn === 1 || req.body.mode === 'label') game.phrases.push(req.body.phrase)
          game.turn = game.turn + 1
          game.lastUpdated = Date.now()
          game.lastTurn = Date.now()
          game.active = true
          game.save()
        }
        res.send('success')
      }
    })
  }


})

app.patch('/images/:game', async (req, res) => {

  ImagesModel.findOne({game: req.params.game}, (err, imageSet) => {
    if (err) {
      res.send(err)
    } else {
      imageSet.images.push(req.body.content)
      imageSet.save()
      res.send('success')
    }
  })

})

app.get('/games', (req, res) => {
  GameModel.find({}, (err, result) => {
    if (err) {
      res.send(err)
    } else {
      res.send(result)
    }
  })
})


app.get('/games/:name', (req, res) => {
  GameModel.findOne({nameLower: req.params.name.toLowerCase()}, (err, result) => {
    if (err) {
      res.send(err)
    } else {
      res.send(result)
    }
  })
})

app.get('/images/:game', (req, res) => {
  ImagesModel.findOne({game: req.params.game}, (err, result) => {
    if (err) {
      res.send(err)
    } else {
      res.send(result)
    }
  })
})

app.get('/phrases', async (req, res) => {
  PhraseModel.findOne({ available: true }, (err, phrase) => {
    if (err) {
      res.send(err)
    } else {
      phrase.available = false
      phrase.save()
      res.send(phrase)
    }
  })
})

app.listen(port, () => {
  console.log(`Sketchly server listening on port ${port}`)
})