const isAuthenticated = (req, res, next) => {
  console.log("Session data:", req.session.user); // Logs the session data for debugging
  if (req.session.user) {
    return next();
  }
  res.status(401).json({ success: false, message: "Not authenticated" });
};
  
  module.exports = isAuthenticated;