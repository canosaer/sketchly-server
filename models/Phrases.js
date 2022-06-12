const mongoose = require('mongoose')

const SketchlySchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    available: {
        type: Boolean,
        required: true,
    },
})

const PhraseModel = mongoose.model('phrases', SketchlySchema)

module.exports = PhraseModel