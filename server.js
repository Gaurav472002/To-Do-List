const express = require("express");

const  mongoose=require("mongoose");
const app = express();

const _ = require("lodash");

const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));

app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://gaurav472:Gaurav472@cluster0.pac5nkl.mongodb.net/Todolist-DB');

}

const itemSchema={ // the schema
    name:String
}

const Item = mongoose.model("items",itemSchema);  // the model

const item1=  new Item({
    name: "Welcome to your todoList"
});

const item2=  new Item({
    name: "Hit the + button to add new items to the list"
});

const item3=  new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema={
    name:String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

    async function setList() {
        try {
          const items = await Item.find({});

           if(items.length===0) {

            Item.insertMany(defaultItems); // push default items to the db
            res.redirect("/");
           }
           
           else{
            res.render("list", { 
                listTitle: "Today", newlistitems:items});
           }
          
        } catch (err) {
          console.log(err);
        }
      }
      setList();
  
  
});

app.get("/:customListName",function(req,res){
    
    const customListName=  _.capitalize(req.params.customListName);

    List.findOne({name: customListName})
    .then(foundList => {
      if(!foundList){
        //create a new list
        const list = new List({
          name: customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        res.render("list", { 
          listTitle: foundList.name, newlistitems:foundList.items
        });
      }
    })
    .catch(error => console.error(error));
})

 



app.post("/",function(req,res){
    
    const itemName = req.body.newitem;
    const listName = req.body.list

    const item = new Item({
        name:itemName
    });

    if(listName=== "Today"){
        item.save(); // push the newly added item to the database

        res.redirect("/");  //redirect to the home route
    } 
    else{

        List.findOne({name: listName})
        .then(foundList => {
          foundList.items.push(item);
          return foundList.save();
        })
        .then(() => {
          res.redirect("/"+ listName);
        })
        .catch(error => console.error(error));
    }

       
});






app.post("/delete", async (req, res) => {

    const checkedItem = req.body.checkbox;
    
    const  listName= req.body.listName;

    if(listName==="Today"){
        const data = await Item.findByIdAndRemove(checkedItem);
    
        if(data){
        
          res.redirect("/");
        
        }
    }
    else{
        List.findOneAndUpdate(
            {name: listName}, 
            {$pull: {items: {_id: checkedItem}}}
          )
            .then(() => {
              res.redirect("/"+ listName);
            })
            .catch(error => console.error(error));
          
    }
    
    
    
    });


    app.listen(PORT, function () {
        console.log("Server started on port "+ PORT);
    });
    