'use strict';

const express = require('express');
const pg = require('pg');

// Constants
const PORT = 5003;

// App
const app = express();
app.get('/', function (req, res) {
  res.send('Hello world\n');
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);

// create a config to configure both pooling behavior
// and client options
const db_config = {
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};


//this initializes a connection pool
const pool = new pg.Pool(db_config);
pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack)
})


// TEST DB

// to run a query we can acquire a client from the pool,
// run a query on the client, and then return the client to the pool
pool.connect(function(err, client, done) {
  if(err) {
    console.error('error fetching client from pool', err);
  }
  console.log('connected')

  client.query('SELECT salutation, instances FROM greeting', function(err, result) {
    //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
    done(err);
    if(err) {
      return console.error('error running query', err);
    }

    console.log(result.rows);
    for (let row of result.rows) {
      console.log(row);
    }
  });
});