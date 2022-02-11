const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname))

// Routes
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname,'index.html'));  
    
});

// Port Listen
app.listen(3000);
console.log('Running...');