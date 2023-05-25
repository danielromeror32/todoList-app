//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect('mongodb+srv://daniel32:ZtzIxrxBLWaO47PZ@cluster0.dne67jt.mongodb.net/todolistDB');

mongoose.connect(process.env.ATLAS_URL,{
  useNewUrlParser: true,
  useUnifiedTopology: true
}); 


const itemSchema = new mongoose.Schema({
  name: String
});

const listSchema ={
  name: String,
  items: [itemSchema]
}

const List = new mongoose.model("List", listSchema);

const Item = new mongoose.model("Item", itemSchema);

const item1  = new Item({
  name: "Welcome to your todoList! "
});

const item2  = new Item({
  name: "Hit the + button to add a new item "
});

const item3  = new Item({
  name: "<-- hit this to delete an item. "
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems).then(result => {
//   console.log("Successfully saved all the items to todolistDB");
// }).catch(error => {
//   console.log(error);
// });



app.get("/", function(req, res) {

  Item.find({}).then((foundIttems) => {
    if (foundIttems.length === 0) {
    Item.insertMany(defaultItems).then(result => {
      console.log("Successfully saved all the items to todolistDB");
    }).catch(error => {
      console.log(error);
    });
    res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundIttems});
    }
  }).catch((error) => {
    console.error('Error al obtener los documentos:', error);
    });
});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
  res.redirect("/");
  } else {
    List.findOne({name: listName}).then((foundLists) =>{
      foundLists.items.push(item);
      foundLists.save();
      res.redirect("/" + listName);
    });
  }

});

app.get ("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);


  List.findOne({name: customListName}).then((foundLists) => {
    if (!foundLists) {
      // Create a new list 

      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName)
    } else {
      // Show an exist list
      res.render("list", {listTitle: foundLists.name, newListItems: foundLists.items});
    }
    }).catch((error) => {
    console.error('Error al obtener los documentos:', error);
    });
});

app.post ("/delete", function(req, res){
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkItemId).then(result => {
      console.log("Successfully delete the item");
      
    }).catch(error => {
        console.log(error);
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}).then(result => {
      console.log("Successfully delete the item");
      res.redirect("/" + listName);
    }).catch(error => {
      console.log(error);
  });
  }


 
  });


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(PORT, function() {
  console.log("Server started on port 3000");
});


