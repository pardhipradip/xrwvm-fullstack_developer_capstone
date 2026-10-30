const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3030;

app.use(cors());
app.use(require('body-parser').urlencoded({ extended: false }));

const reviewsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'reviews.json'), 'utf8')
);
const dealershipsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'dealerships.json'), 'utf8')
);

const Reviews = require('./review');
const Dealerships = require('./dealership');

// Home
app.get('/', (req, res) => {
  res.send('Welcome to the Mongoose API');
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Fetch reviews for one dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({
      dealership: Number(req.params.id)
    });
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching dealer reviews' });
  }
});

// Fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    const documents = await Dealerships.find();
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching dealerships' });
  }
});

// Fetch dealerships in a state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const documents = await Dealerships.find({
      state: new RegExp(`^${req.params.state}$`, 'i')
    });
    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching dealerships by state' });
  }
});

// Fetch one dealership by its ID
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealerId = Number(req.params.id);
    const document = await Dealerships.findOne({ id: dealerId });

    if (!document) {
      return res.status(404).json({ error: 'Dealer not found' });
    }

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching dealership' });
  }
});

// Insert a review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const data = JSON.parse(req.body.toString());
    const latestReview = await Reviews.findOne().sort({ id: -1 });
    const newId = latestReview ? latestReview.id + 1 : 1;

    const review = new Reviews({
      id: newId,
      name: data.name,
      dealership: Number(data.dealership),
      review: data.review,
      purchase: data.purchase,
      purchase_date: data.purchase_date,
      car_make: data.car_make,
      car_model: data.car_model,
      car_year: Number(data.car_year)
    });

    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Connect, load data, then start the API
async function startServer() {
  try {
    await mongoose.connect('mongodb://mongo_db:27017/', {
      dbName: 'dealershipsDB'
    });

    await Reviews.deleteMany({});
    await Reviews.insertMany(reviewsData.reviews);

    await Dealerships.deleteMany({});
    await Dealerships.insertMany(dealershipsData.dealerships);

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Could not start the API:', error);
    process.exit(1);
  }
}

startServer();