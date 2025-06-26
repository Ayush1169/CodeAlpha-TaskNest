var express = require('express');
var router = express.Router();
const User = require('./user'); 
const Project = require('./project')
const passport = require('passport');
const Task = require('./task')
const Comment = require('./comment')
const user = require('./user');
const Notification = require('./notification');
const comment = require('./comment');

/* GET home page. */

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    });
    res.render('index', { user: req.user, projects });
  } catch (err) {
    console.log(err);
    res.redirect('/login');
  }
});


router.get('/login', (req, res) =>{
  res.render('login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}))

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', async (req, res) => {
  try{
    const { username, email, password } = req.body
    const user = new User({ username, email })
    await User.register(user, password)
    passport.authenticate('local')(req, res, () => {
      res.redirect('/login')
    })
  } catch (err) {
    console.log(err)
    res.redirect('/register')
  }
})

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    res.redirect('/login');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

router.get('/projects/new', isLoggedIn, async (req, res) => {
  const users = await User.find({_id: {$ne: req.user._id } })
  res.render('project', { project: null, task: [], users, comment: [], user: req.user })
})

router.post('/projects', isLoggedIn, async (req, res) => {
  const {title, description, members } = req.body
  try {
    await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: Array.isArray(members) ? members : [members]
    })
    res.redirect('/')
    const projects = await Project.find({ createdBy: req.user._id });
    res.render('index', { user: req.user, projects })
  } catch (err) {
    console.log (err)
    res.redirect('/projects/new')
  }
})

router.get('/projects/:id', isLoggedIn, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      const isAuthorized = project.createdBy.equals(req.user._id) || project.members.includes(req.user._id);
  if (!isAuthorized) return res.status(403).send("Unauthorized");

    const tasks = await Task.find({ project: project._id }).populate('assignedTo');
    const users = await User.find()
    const taskIds = tasks.map(t => t.id)
    const comments = await Comment.find({ task: { $in: taskIds }}).populate('author')

    res.render('project', { project, tasks, users, comments, user: req.user })
  } catch (err) {
    console.log(err)
    res.redirect('/')
  }
})


router.post('/projects/:id/tasks', isLoggedIn, async (req, res) => {
  const { title, description, status, assignedTo } = req.body;
  try {
   const task = await Task.create({
      title,
      description,
      status,
      assignedTo,
      createdBy: req.user._id,
      project: req.params.id
    });

    if (assignedTo) {
      await Notification.create({
        recipient: assignedTo,
        sender: req.user._id,
        type: 'assigment',
        message: `You Were assigned a new task ${title}`,
        link: `/projects/${req.params.id}`
      })
    }

    res.redirect('/projects/' + req.params.id);
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

router.post('/tasks/:taskId/comments', isLoggedIn, async (req, res) => {
  try {
    await Comment.create({
      text: req.body.text,
      task: req.params.taskId,
      author: req.user._id

    })
    const task = await Task.findById(req.params.taskId)
    res.redirect(`/projects/${task.project._id}`)
  } catch (err) {
    console.log(err)
    res.redirect('/')
  }
})

router.delete('/projects/:id', isLoggedIn, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.redirect('/')

      if (String(project.createdBy) !== String(req.user._id)) {
        return res.status (403).send("Unautharized")
      }

      await Task.deleteMany({ project: project._id })
      await Project.findByIdAndDelete(req.params.id)

      res.redirect('/')
  } catch (err) {
    console.log(err)
    res.redirect('/')
  }
})

router.delete('/tasks/:id', isLoggedIn, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.redirect('/')

      if (String(task.createdBy) !== String(req.user._id)) {
        return res.status (403).send("Unautharized")
      }

      await Task.findByIdAndDelete(req.params.id)

      res.redirect('/projects/' + task.project._id)
  } catch (err) {
    console.log(err)
    res.redirect('/')
  }
})

router.get('/assigned-tasks', isLoggedIn, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id }).populate('project');
    res.render('assignedTasks', { tasks, user: req.user });
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

router.get('/notifications', isLoggedIn, async (req, res) => {
  try{
  const notification = await Notification.find({ recipient: req.user._id }).sort({ createdAt:  -1})
  res.render('notification', {notification: notification})
  } catch (err) {
    console.log(err)
    res.redirect('/')
  }
})

module.exports = router;
