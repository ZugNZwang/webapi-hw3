var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

var ActorSchema = new Schema ({
    actorName: String,
    characterName: String
});

// movie schema
var MovieSchema = new Schema({
    title: String,
    year: Number,
    genre: String,
    actors: [ActorSchema]
});




// return the model
module.exports = mongoose.model('Movie', MovieSchema);