const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(" Authorization Header:", authHeader); // Debug authorization header

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    console.log(" Extracted Token:", token); // Debug extracted token

    try {
      console.log("Verifying token with secret:", process.env.JWT_SECRET ? 'Present' : 'Missing');
      console.log("JWT_SECRET used in verify:", process.env.JWT_SECRET);
      console.log("Received Token:", token);


      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(" Token Decoded:", decoded); // Debug decoded token

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        console.log(" User not found in DB for ID:", decoded.id);
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      console.log(" Authenticated User:", req.user.email); // Debug authenticated user
      next();
    } catch (error) {
      console.error("Token verification failed:", error.message); // Debug verification error
      res.status(401).json({ message: "Invalid token", error: error.message });
    }
  } else {
    console.log(" No Authorization header or malformed");
    res.status(401).json({ message: "Authorization token missing" });
  }
};
console.log(" JWT_SECRET used in verify:", process.env.JWT_SECRET);


module.exports = protect;
