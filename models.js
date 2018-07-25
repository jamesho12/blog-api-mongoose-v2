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

const blogPostsSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  comments: [commentSchema]
});

// so this virutal and serialize is needed to put together firstName and lastName for author?

blogPostsSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

// even without a virtual, we would still need to serialize correct?

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
    commens: this.comments
  };
}

const Author = mongoose.model('Author', authorSchema);
const BlogPosts = mongoose.model('BlogPosts', blogPostsSchema);

// what is the proper naming convention for collections? Camel case or lowercase?
// so in the example mongoose.model breaks it down from 'Restaurants' to 'restaurants', how would this work for 'BlogPosts'?
// will it be 'blogPosts' or 'blogposts'

module.exports = { BlogPosts, Author };
