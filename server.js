const express = require('express');
//const cors = require('cors');
const bodyParser = require('body-parser');
//const shortid = require('shortid');
const mongoose = require('mongoose');
const moment = require('moment');
const User = require('./models/User');
require('dotenv').config();

// App init
const app = express();

// Database mounting
const uri = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });

    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
connectDB()

// Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//app.use(cors());
app.use(express.static('public'));


//Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Create a user by posting form data username & return an object with username and _Id
app.post('/api/exercise/new-user', async(req, res) => {
  const { username } = req.body;
  const accu = [];
  const userObj = {
    _id: new mongoose.Types.ObjectId,
    username: username
  };
  const user = new User(userObj);
  const saveUser = await user.save((err, data) => {
    if(err) {
      res.send(err)
    }else {
      const userreturn = {
        _id: data._id,
        username: data.username
      }
      accu.push(userreturn)
      res.json(accu)
    }


  })
});

// Get an array of All users with the new-user route returned object
app.get('/api/exercise/users', (req, res) => {
  User.find({}, (err, data) => {
    if(err) {
      res.send(err)
    }else {
      console.log(data)
      const resp = data.forEach((item, i) => {
        return {
          _id: item._id,
          username: item.username,
          exercise: i
        }
      })
      res.json(data)
    }
  });
});

// Add an exercise to any user by posting  form data, userId(_id),description,duration, date(optional parse)
// If no date is supplied the returned object must have a default date current one
app.post('/api/exercise/add', async(req, res) => {
  let { description, duration, date, userId } = req.body;
  const findUser = await User.findOne({_id: userId})
  findUser.exercise.push({
    "description": description,
    "duration": duration,
    "date": date
  })
  const updated = await findUser.save((err, data) => {
    if(err) {
      res.send(err)
    } else {
      const item = data.exercise.splice(-1);
      console.log(item)
      const resp = {
        username: data.username,
        description: item[0].description,
        duration: item[0].duration,
        _id: item[0]._id,
        date: item[0].date
      };
      res.json(resp)
    }
  });
});
const getFormattedDate = date => moment(date).format("ddd MMM DD YYYY");

app.get("/api/exercise/log:userId", (req, res) => {
  const { from, to, limit, userId } = req.query;

  User.findById(userId, (err, userData) => {
    if (userData) {
      userData.count = userData.log.length;
      userData.log.forEach(log => (log.date = getFormattedDate(log.date)));
      res.json(userData);
    } else res.send(err);
  });
});


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})


app.listen(3000, () => {
  console.log(`Server started on port 3000`);
});