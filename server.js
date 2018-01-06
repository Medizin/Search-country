const express = require('express');
    app = express(),
    fs = require("fs"),
    path = require('path'),
    data = fs.readFileSync("data.json"),
    jsonData = JSON.parse(data);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/country/search/:pattern', function (req, res, next) {
    let result = [],
        cond = new RegExp(req.params.pattern, 'i');
         
    for (let key in jsonData.countries) {
        let reg = key.match(cond);
        if (reg && reg.index === 0) {
            result.push(key);
        }
    }
    res.send(result)//
    //setTimeout(() =>  res.send(result), 2700)
});

app.get('/city/search/:country', function (req, res, next) {
    let result = [];

    jsonData.countries[req.params.country].forEach((elem) => {
        result.push(elem);
    });
        
    setTimeout(() =>  res.send(result), 300);
});

app.listen(8080, () => {
    console.log("Server has started.")
});