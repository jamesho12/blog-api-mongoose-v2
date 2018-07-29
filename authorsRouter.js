const express = require('express');
const router = express.Router();

const { BlogPosts, Authors } = require('./models');

router.post('/', (req, res) => {
  const requiredFields = ['firstName', 'lastName', 'userName'];

  for(let i=0; i<requiredFields.length; i++) {
      if(!(requiredFields[i] in req.body)) {
        const message = `Missing \`${requiredFields[i]}\` in request body`;
        return res.status(400).send(message);
      }
  }

// what's the difference between this implementation and letting the mongoose indicate the duplicate entry with the 11000 error code vs using an initial search? Would the latter be cleaner and a more common approach since maybe the 11000 mongoose err.code is standardize but others might not be and therefore can be confusing?

  Authors
    .create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName
    })
    .then(author => res.status(201).json(author.serialize()))
    .catch(err => {
      if(err.code === 11000)
        res.status(409).json({ message: err.errmsg});
      else
        res.status(500).json(err);
    });
});

router.put('/:id', (req, res) => {
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = `Request path id (${ req.params.id }) and request body id ` +
      `(${ req.body.id}) must match`;
    return res.status(400).json({ message });
  }

  const toUpdate = {};
  const updateableFields = ['firstName', 'lastName', 'userName'];

  updateableFields.forEach(field => {
    if(field in req.body)
      toUpdate[field] = req.body[field];
  });

  Authors
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(post => res.status(204).end())
    .catch(err => {
      if(err.code === 11000)
        res.status(409).json({ message: err.errmsg});
      else
        res.status(500).json(err);
    });
});

// if(process.env.NODE_ENV === 'development')
//   console.log('Development');

router.get('/:id', (req, res) => {
  Authors
    .findById(req.params.id)
    .then(author => {
      BlogPosts
        .find({ author: author.id})
        .then(posts => {
          res.json({ posts: posts.map(post => post.serialize()) });
        })
        .catch(err => { res.status(500).json(err); });
    });
});

// was there any reason why there's a return res.status in the nested?
// so let's say the inner catch statement is triggered, will it still trigger the outter and overwrite the response?
// I looked at how the solution was written and they only had a catch statement on the outter level

router.delete('/:id', (req, res) => {
  Authors
    .findByIdAndRemove(req.params.id)
    .then(author => {
      BlogPosts
        .remove({ author: author.id})
        .then(() => res.status(204).end())
        .catch(err => {
          return res.status(500).json(err)
        });
    })
    .catch(err => res.status(500).json(err));
});

module.exports = router;
