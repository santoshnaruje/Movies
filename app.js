const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let db = null;
const app = express();
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

let convertDbObject = (dbObj) => {
  return {
    movieName: dbObj.movie_name,
  };
};
let convertDirector = (dbObj) => {
  return {
    directorId: dbObj.director_id,
    directorName: dbObj.director_name,
  };
};
let convertJsonObject = (movie) => {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
};

const initializeDbAndStartServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is started ");
    });
  } catch (e) {
    console.log(`Db Error:${e.message}`);
  }
};
initializeDbAndStartServer();

app.get("/movies/", async (request, response) => {
  const movieQuery = `
    SELECT 
    movie_name
    FROM
    movie
    `;
  const dbResponse = await db.all(movieQuery);
  response.send(
    dbResponse.map((obj) => {
      return convertDbObject(obj);
    })
  );
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const postQuery = `
    INSERT INTO
    movie(director_id,movie_name,lead_actor)
    VALUES(${directorId},'${movieName}','${leadActor}');
    `;
  const dbResponse = await db.run(postQuery);
  const movie_id = dbResponse.lastID;
  console.log(movie_id);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `
    SELECT 
    * 
    FROM
    movie
    WHERE movie_id='${movieId}';
    `;
  const dbResponse = await db.get(movieQuery);
  response.send(convertJsonObject(dbResponse));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieQuery = `
    UPDATE movie
    SET
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE movie_id='${movieId}';
    `;
  const dbResponse = await db.run(movieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteBookQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const dbResponse = await db.run(deleteBookQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const movieQuery = `
    SELECT 
    *
    FROM
    director
    `;
  const dbResponse = await db.all(movieQuery);
  response.send(
    dbResponse.map((obj) => {
      return convertDirector(obj);
    })
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const deleteBookQuery = `
    SELECT 
    *  
    FROM
    movie
    where director_id=${directorId}`;
  const dbResponse = await db.all(deleteBookQuery);
  response.send(
    dbResponse.map((obj) => {
      return convertDbObject(obj);
    })
  );
});

module.exports = app;
