var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var UserSchema = new Schema({
    username: { type: String, unique: true },
    email: String,
    color: String,
    hashed_password: String,
    imgurl: { type: String, default: "https://www.rover.com/blog/wp-content/uploads/2015/07/pug-sunglasses.jpg"},
    bio: { type: String, default: "I'm cool!"},
    pendingFRs: []
});
mongoose.model('User', UserSchema);
