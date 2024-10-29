import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "postgres",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;


async function currentusers(){
 return await db.query("SELECT * FROM users where id = $1",[currentUserId]);
  
}

async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries where user_id = $1",[currentUserId]);
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const thisuser= await currentusers(); 
  const youruser = thisuser.rows[0];
  let users = await db.query("SELECT * FROM users");
  // console.log(users);
  console.log(youruser);
  console.log(countries);
  console.log("req.body");
console.log(req.body);//requested
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users.rows,
    color: youruser.color,
  });
});
app.post("/add", async (req, res) => {
console.log(req.body);
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code,user_id) VALUES ($1,$2)",
        [countryCode,currentUserId]
      );
      res.send({
        number: 10,
      }).redirect("/");
    } catch (err) {
      console.log(err);
      const countries = await checkVisisted();
  const thisuser= await currentusers(); 
  const youruser = thisuser.rows[0];
  let users = await db.query("SELECT * FROM users");
  // console.log(users);
  console.log(youruser);
  console.log(countries);

  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users.rows,
    color: youruser.color,
    error: "Enter correct country name"
  });
    }
  } catch (err) {
    console.log(err);
    const countries = await checkVisisted();
  const thisuser= await currentusers(); 
  const youruser = thisuser.rows[0];
  let users = await db.query("SELECT * FROM users");
  // console.log(users);
  console.log(youruser);
  console.log(countries);

  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users.rows,
    color: youruser.color,
    error: "Enter correct country name"
  });
  }
});




app.post("/user", async (req, res) => {
  if(Object.values(req.body)[0]=="new"){
    
    res.render("new.ejs",{});
  }
  else{
    currentUserId= Object.values(req.body)[0];
    res.redirect("/");
   
  }
});



app.post("/new", async (req, res) => {
  
  console.log(req.body);
  const newuser = req.body;
  const newid = await db.query("INSERT INTO users(name, color) VALUES($1,$2) RETURNING id",[newuser.name,newuser.color]);
  console.log(newid);
  currentUserId = newid.rows[0].id;
  res.redirect("/");

});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
