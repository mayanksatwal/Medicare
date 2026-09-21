const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "MediCare Backend is running successfully!"
  });
});

// Login API
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  console.log("Login request received:", email);

  if (email === "test@gmail.com" && password === "123456") {
    return res.json({
      success: true,
      message: "Login successful!"
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid email or password"
  });
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`MediCare backend running on http://localhost:${PORT}`);
});