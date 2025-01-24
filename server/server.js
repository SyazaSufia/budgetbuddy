const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
    origin: "http://localhost:5173",
};

app.use(cors(corsOptions));

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});