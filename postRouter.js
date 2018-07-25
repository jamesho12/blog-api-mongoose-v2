const express = require('express');
const router = express.Router();

const { BlogPosts } = require('./models');

router.get('/', (req, res) => {
  BlogPosts
    .find()
    .then(posts => {
      res.json({ posts: posts.map(post => post.serialize()) });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    });
});

router.get('/:id', (req, res) => {
  BlogPosts
    .findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

router.post('/', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  const nestedFields = ['firstName', 'lastName'];

  console.log(req.body);

  for(let i=0; i<requiredFields.length; i++) {
    if(!(requiredFields[i] in req.body)) {
      const message = `Missing \`${requiredFields[i]}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }

    try {
      if(requiredFields[i] === 'author') {
        for(let k=0; k<nestedFields.length; k++) {
          if(!(nestedFields[k] in req.body.author)) {
            const message = `Missing \`${requiredFields[i]}\` in author field of the request body`;
            console.error(message);
            return res.status(400).send(message);
          }
        }
      }
    } catch(err) {
        return res.status(500).json({ message: 'Author value is incorrect'});
    }
  }

  BlogPosts
    .create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
    })
    .then(post => res.status(201).json(post.serialize()))
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
  const updateableFields = ['title', 'content', 'author'];
  const nestedFields = ['firstName', 'lastName'];

  console.log(req.body);

  updateableFields.forEach(field => {
    if(field in req.body) {
      toUpdate[field] = req.body[field];
    }

    if(field === 'author') {
      if(typeof(req.body.author) !== "object") {
        return res.status(400).send({ message: 'Author value is incorrect'})
      } else {
        for(let k=0; k<nestedFields.length; k++) {
          if(!(nestedFields[k] in req.body.author)) {
            const message = `Missing \`${nestedFields[k]}\` in author field of the request body`;
            console.error(message);
            return res.status(400).send(message);
          }
        }
      }
    }
  });

  BlogPosts
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }) );
});

router.delete('/:id', (req, res) => {
  BlogPosts
    .findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }) );
});

module.exports = router;
