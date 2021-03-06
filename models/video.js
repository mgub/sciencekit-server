var mongoose = require("mongoose")
var Account = require("./account")

var videoSchema = new mongoose.Schema({
  moment: { type: mongoose.Schema.Types.ObjectId, ref: "Moment" },
  uri: { type: String, required: true },
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
})

module.exports = mongoose.model("Video", videoSchema)
