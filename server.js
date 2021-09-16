const app = require('./app')
const mongoose = require('mongoose')

mongoose
.connect(
  process.env.MONGODB_URI,{
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true
}, () => {
  console.log("Connected to db :) ")
});

mongoose.connection.once('open', () => { 
  app.emit('ready'); 
})

app.on('ready', function() { 
    app.listen(process.env.PORT, () => { 
        console.log(`Server up and running on port ${process.env.PORT} :)`);
      
    }); 
}); 

