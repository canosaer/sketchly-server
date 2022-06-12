const mongoose = require('mongoose')

const SketchlySchema = new mongoose.Schema({
    images: [{
        type: String,
    }],
    game: {
        type: String,
        required: true,
    },
})

const ImagesModel = mongoose.model('images', SketchlySchema)

module.exports = ImagesModel