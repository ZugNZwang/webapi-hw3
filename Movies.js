var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

// Actor schema
/*var ActorSchema = new Schema ({
    actorName: { type: String, required: true },
    characterName: { type: String, required: true }
});*/

// Movie schema
var MovieSchema = new Schema({
    title: { type: String, required: true },
    year: {
        type: Number,
        min: 1880,
        max: 2018,
        required: true
    },
    genre: {
        type: String,
        enum: ['Action','Adventure', 'Comedy',
            'Drama','Fantasy','Horror', 'Mystery',
            'Thriller', 'Western'],
        required: true
    },
    actors: {
        type: [{
            actorName: {type: String, required: true},
            characterName: {type: String, required: true}
        }], required: true
    }
});
/*
MovieSchema.pre('save', function(next) {
  if(this.actors.length < 3) {
      return next(new Error('Fewer than 3 Actors'));
  }
});
*/
// return the model
module.exports = mongoose.model('Movie', MovieSchema);