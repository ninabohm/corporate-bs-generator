const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  wordType: {
    type: String,
    required: true
  },
  wordContent: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },  
  userId: {
    type: String,
    required: true,
  },
});

// entrySchema.pre('validate', function(next) {
//   if (this.title) {
//     this.slug = slugify(this.title, { lower: true, strict: true });
//   }

//   if (this.markdown) {
//     this.sanitizedHtml = dompurify.sanitize(marked(this.markdown));
//   }

//   next();
// })

module.exports = mongoose.model('Entry', entrySchema);