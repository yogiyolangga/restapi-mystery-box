const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const mysql = require("mysql");

const cookieParser = require("cookie-parser");
const session = require("express-session");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "mysterybox",
});

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    secret: "mysterybox",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

app.get("/", (req, res) => {
  const sqlSelect = "SELECT * FROM datatiket";
  db.query(sqlSelect, (err, result) => {
    res.send("Mystery Box RestAPI Server");
  });
});

app.get("/api/get", (req, res) => {
  const sqlSelect = "SELECT * FROM datatiket ORDER BY tanggal DESC";
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  });
});

app.post("/api/daterange", (req, res) => {
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const sqlSelect =
    "SELECT * FROM datatiket WHERE tanggal >= ? AND tanggal <= ?";
  db.query(sqlSelect, [startDate, endDate], (err, result) => {
    res.send(result);
  });
});

app.get("/api/gettoday/:tanggal", (req, res) => {
  const tanggal = req.params.tanggal;

  const sqlSelect =
    "SELECT * FROM datatiket WHERE tanggal = ? ORDER BY id DESC";
  db.query(sqlSelect, [tanggal], (err, result) => {
    res.send(result);
  });
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    const sqlSelect = "SELECT * FROM prize";
    db.query(sqlSelect, (err, result) => {
      res.send({ loggedIn: true, user: req.session.user, result });
    });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.send({ loggedIn: false });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const kode = req.body.kode;

  db.query(
    "SELECT * FROM datatiket WHERE username = ? AND kode = ?",
    [username, kode],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        req.session.user = result;
        console.log(req.session.user);
        res.send(result);
      } else {
        res.send({ message: "Something going wrong dude" });
      }
    }
  );
});

app.post("/insertprize", (req, res) => {
  const prize1 = req.body.prize1;
  const prize2 = req.body.prize2;
  const prize3 = req.body.prize3;
  const prize4 = req.body.prize4;
  const prize5 = req.body.prize5;
  const prize6 = req.body.prize6;
  const prize7 = req.body.prize7;
  const prize8 = req.body.prize8;

  const sqlInsert =
    "INSERT INTO prize (prize) VALUES (?),(?),(?),(?),(?),(?),(?),(?)";

  const sqlDelete = "DELETE FROM prize";

  const values = [
    prize1,
    prize2,
    prize3,
    prize4,
    prize5,
    prize6,
    prize7,
    prize8,
  ];

  if (
    prize1 === "" ||
    prize2 === "" ||
    prize3 === "" ||
    prize4 === "" ||
    prize5 === "" ||
    prize6 === "" ||
    prize7 === "" ||
    prize8 === ""
  ) {
    return res.send({ message: "Field tidak boleh kosong" });
  } else {
    db.query(sqlDelete);

    db.query(sqlInsert, values, (err, result) => {
        res.send({ messageSuccess: "Data Prize Has Been Changed!" });
    });
  }
});

app.get("/prize", (req, res) => {
  sqlSelect = "SELECT * FROM prize";
  db.query(sqlSelect, (err, result) => {
    res.send(result);
  })
})

app.post("/api/insert", (req, res) => {
  const username = req.body.username;
  const kode = req.body.kode;
  const hadiah = req.body.hadiah;
  const tanggal = req.body.tanggal;

  const sqlInsert =
    "INSERT INTO datatiket (tanggal, username, kode, hadiah, chance) VALUES (?,?,?,?,?)";
  const check = "SELECT * FROM datatiket WHERE kode = ?";

  db.query(check, [kode], (err, result) => {
    if (err) {
      res.send({ err: err });
    }

    if (username === "") {
      res.send({ message: "Username Tidak Boleh Kosong!" });
    } else if (kode === "") {
      res.send({ message: "Kode Tidak Boleh Kosong!" });
    } else if (hadiah === "") {
      res.send({ message: "Pilih Hadiah!" });
    } else if (result.length > 0) {
      res.send({ message: "Maaf, Tiket sudah ada! Generate Ulang!" });
    } else {
      db.query(
        sqlInsert,
        [tanggal, username, kode, hadiah, 1],
        (err, result) => {
          console.log(result);
          res.send(result);
        }
      );
    }
  });
});

app.delete("/api/delete/:id", (req, res) => {
  const id = req.params.id;
  const sqlDelete = "DELETE FROM datatiket WHERE id = ?";

  db.query(sqlDelete, id, (err, result) => {
    if (err) console.log(err);
  });
});

app.delete("/api/deletenew/:kode", (req, res) => {
  const kode = req.params.kode;
  const sqlDelete = "DELETE FROM datatiket WHERE kode = ?";

  db.query(sqlDelete, kode, (err, result) => {
    if (err) console.log(err);
  });
});

app.put("/api/update/:id", (req, res) => {
  const id = req.params.id;
  const sqlUpdate = "UPDATE datatiket SET chance = 0 WHERE id = ?";

  db.query(sqlUpdate, id, (err, result) => {
    if (err) console.log(err);
  });
});

app.listen(3001, () => {
  console.log("listening on port 3001");
});
