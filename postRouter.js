const express = require('express');
const router = express.Router();

const { BlogPosts } = require('./models');

// for the notation in the serialize, could we have put brackets around it?
// when do we use brackets vs not? for one commands?
// and for one line commands without it we don't use ; is this the only difference?
// is the bracket just required if we want to return early? then optional otherwise

// .catch(err => { res.status(500).json(err); });
// .catch(err => res.status(500).json(err));
// .catch(err => { return res.status(500).json(err); });

router.get('/', (req, res) => {
  BlogPosts
    .find()
    .then(posts => {
      res.json({ posts: posts.map(post => post.serialize()) });
    })
    .catch(err => { res.status(500).json(err); });
});

// what's the difference with including a return vs not returning the response?
// if it's the end of the function with nothing left over there's no difference?

router.get('/:id', (req, res) => {
  BlogPosts
    .findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => res.status(500).json(err));
});

router.post('/', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  const nestedFields = ['firstName', 'lastName'];

  for(let i=0; i<requiredFields.length; i++) {
    if(!(requiredFields[i] in req.body)) {
      const message = `Missing \`${requiredFields[i]}\` in request body`;
      return res.status(400).send(message);
    }
  }

  BlogPosts
    .create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
    })
    .then(post => { res.status(201).json(post.serialize()); })
    .catch(err => { res.status(500).json({ message: 'Internal server error'}) });
});

router.put('/:id', (req, res) => {
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${ req.params.id }) and request body id ` +
      `(${req.body.id}) must match`
    );
    return res.status(400).json({ message });
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if(field in req.body)
      toUpdate[field] = req.body[field];
  });

  BlogPosts
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json(err));
});

router.delete('/:id', (req, res) => {
  BlogPosts
    .findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json(err));
});

module.exports = router;
