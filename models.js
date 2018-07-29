const mongoose = require('mongoose');

const authorSchema = mongoose.Schema({
  firstName: 'string',
  lastName: 'string',
  userName: {
    type: 'string',
    unique: true
  }
});

const commentSchema = mongoose.Schema({ content: 'string' });

// so the reference here, is this for the collection name?

const blogPostsSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Authors'
  },
  comments: [commentSchema]
});

blogPostsSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostsSchema.pre('findOne', function(next) {
  this.populate('author');
  next();
});

blogPostsSchema.pre('find', function(next) {
  this.populate('author');
  next();
});

blogPostsSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorName,
    comments: this.comments
  };
}

authorSchema.methods.serialize = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    userName: this.userName
  };
}

const Authors = mongoose.model('Authors', authorSchema);
const BlogPosts = mongoose.model('BlogPosts', blogPostsSchema);

module.exports = { BlogPosts, Authors };
