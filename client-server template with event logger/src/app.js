const express = require('express');
const requestLogger = require('./middlewares/requestlogger');
const securityLogger = require('./middlewares/securityLogger');
const demoRoutes = require('./routes/demoroutes');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();
const userRoutes = require('./routes/userroutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/demo', demoRoutes);
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use(securityLogger);
app.use(requestLogger);
const PORT = process.env.PORT || 3000;
module.exports = app;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
