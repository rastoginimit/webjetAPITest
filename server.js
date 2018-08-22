var http = require('http');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var port = process.env.PORT || 8092;
var Request = require("request");

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var html_div = "";

var getheaders = {
    'x-access-token': 'sjd1HfkjU83ksdsm3802k', 
    'content-type' : 'application/json;charset=UTF-8'
};
var apiOptionsC = {
    url: "http://webjetapitest.azurewebsites.net/api/cinemaworld/movies",
    method: "GET",
    headers: getheaders
};

var apiOptionsF = {
    url: "http://webjetapitest.azurewebsites.net/api/filmworld/movies",
    method: "GET",
    headers: getheaders
};

var apiOptionsDtlsC = {
    url: "http://webjetapitest.azurewebsites.net/api/cinemaworld/movie",
    method: "GET",
    headers: getheaders
};

var apiOptionsDtlsF = {
    url: "http://webjetapitest.azurewebsites.net/api/filmworld/movie",
    method: "GET",
    headers: getheaders
};

var moviesListC;
var moviesListF;
var movies = {};
movies["Movies"] = [];

// Get the list of movies available from cinemaworld API
Request(apiOptionsC, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        moviesListC = JSON.parse(body);
        
        // Get the list of movies available from filmworld API
        Request(apiOptionsF, function (errorF, responseF, bodyF) {
            if (!errorF && responseF.statusCode == 200) {
                moviesListF = JSON.parse(bodyF);
            }
            
            //consolidate all the movies into one array
            consolidateMovies(moviesListC, movies, "C");
            consolidateMovies(moviesListF, movies, "F");
            html_div = createMovieCardDivs(movies["Movies"]);
        });
    }
});

// function to generate the index html page and display
app.get('/', function (req, res) {
    fs.readFile('index.html', function (err, data) {
        var newData = data.toString().replace(/~ImageCards~/g, html_div);
        res.send(newData);
    });
});

// action on the button click to get the best price
app.post('/', function (req, res) {
    var id1 = req.body.id1;
    var id2 = req.body.id2;
    getBestPrice(id1, id2).then(function(result){
        res.send('The Best Price for this movie is: ' + result)});
});

// start the server
var server = app.listen(3100, function () {
    console.log('Node server is running on port 3100..');
});

// function to check if the given movie title and year
// are present in the JSON Array and return the index
function checkMovie(MovieObj, title, year) {
    for (var m in MovieObj){
        if(MovieObj[m].Title == title & MovieObj[m].Year == year){
            return m;
        }
    }
    return -1;
}

// function to Consolidate all the movies into one JSON array
// Keep the IDs from both the APIs
function consolidateMovies(moviesList, movies, apiCode){
    var id1;
    var id2;
    
    for (i in moviesList.Movies){
        if (apiCode == "C"){ //fucntion called with the cinemaworld movies list
            id1 = moviesList.Movies[i].ID;
            id2 = "X";
        }
        else if(apiCode == "F"){ //fucntion called with the filmworld movies list
            id1 = 'X';
            id2 = moviesList.Movies[i].ID;
        }
        var data = {
                    "Title" : moviesList.Movies[i].Title, 
                    "Year"  : moviesList.Movies[i].Year, 
                    "ID1"   : id1, 
                    "ID2"   : id2, 
                    "Poster": moviesList.Movies[i].Poster
        };
        //check if the same movie title and year is present in the consolidated array 
        var isThere = checkMovie(movies["Movies"], data.Title, data.Year);
        if(isThere==-1){ // if not present then add
            movies["Movies"].push(data);
        }
        else{ // if present then update the ID
            if (apiCode == "C"){
                movies["Movies"][isThere].ID1 = data.ID1;
            }
            else if(apiCode == "F"){
                movies["Movies"][isThere].ID2 = data.ID2;
            }
        }
    }
}

// function to generate HTML Div Elements
// to desplay the movies in a card layout
function createMovieCardDivs(moviesArray){
    var html_div1 = '';
    for(var i in moviesArray){
        var html_div_card = "<div class='movie_card'>"+
                                //poster of the movie
                                "<img src='"+moviesArray[i].Poster+"'>" + 
                                //movie title and year
                                "<div class='movie_title'> "+moviesArray[i].Title+"<br/>"+moviesArray[i].Year+"</div>" +
                                //button to get the best price
                                "<form action='/' method='post'>" + 
                                "    <input name='id1' type='hidden' value = '"+moviesArray[i].ID1+"'/>" + 
                                "    <input name='id2' type='hidden' value = '"+moviesArray[i].ID2+"' />" + 
                                "    <input type='submit' />" +
                                "</form>" +
                            "</div>";
        html_div1 = html_div1 + html_div_card;
    }
    return html_div1;
}

// Anync function to get the price of a movie from both the APIs 
// and return the best price
async function getBestPrice(id1, id2){
        apiOptionsDtlsC.url = "http://webjetapitest.azurewebsites.net/api/cinemaworld/movie/"+id1;
        apiOptionsDtlsF.url = "http://webjetapitest.azurewebsites.net/api/filmworld/movie/"+id2;
        var price = 9999;
        
        // sleep for 1 sec
        await sleep(1000);
        
        // call cinemaworld API to get the movie price
        Request(apiOptionsDtlsC, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                moviesDetailsC = JSON.parse(body);
                if (parseFloat(moviesDetailsC.Price) < price){
                    price = parseFloat(moviesDetailsC.Price);
                    //console.log(price);
                }   
            }
            else 
                console.log(response.statusCode);
        });
        // sleep for 2 secs
        await sleep(2000);
        
        // call filmworld API to get the movie price
        Request(apiOptionsDtlsF, function (errorF, responseF, bodyF) {
            if (!errorF && responseF.statusCode == 200) {
                moviesDetailsF = JSON.parse(bodyF);
                if (parseFloat(moviesDetailsF.Price) < price){
                    price = parseFloat(moviesDetailsF.Price);
                    //console.log(price);
                }
                else 
                    console.log(responseF.statusCode);
            }
        });
        // sleep for 1 sec
        await sleep(1000);
        //return Promise.resolve(price);
        return price;
}

// function to let the code pause between the asynchronous API calls
function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}
