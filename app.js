import express from "express";
import mongoose from 'mongoose';
import _ from "lodash";

const app = express();


// -----------------------------------------------------

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"))

// -----------------------------------------------------

mongoose.connect("mongodb+srv://admin-lian:BaskervilleSH2@primarycluster.mzzbkki.mongodb.net/todolistDB")

const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Learn React"
})

const item2 = new Item({
    name: "Develop Projects"
})

const item3 = new Item({
    name: "Publish it."
})

const defaultItems = [item1, item2, item3]

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

// -----------------------------------------------------

app.get("/", (req, res) => {
    
    Item.find({}, (err, items) => {
        if ( items.length === 0 ) {
            Item.insertMany(defaultItems, (err) => {
                if ( err ) {
                    console.log(err);
                } else {
                    console.log("Successfully inserted.");
                }
            })
            res.redirect("/");
        } else {
            res.render("list", { listTitle: "Today", newList: items })
        }
    })
    
    
})

app.get('/favicon.ico', (req, res) => res.status(204).end()); 

app.post("/", async (req, res) => {
    
    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const newItem = new Item({
        name: itemName
    })
    
    if ( listName === "Today" ) {
        try {
            await newItem.save();
            res.redirect("/");
        } catch (error) {
            res.status(500).send(err);
        }
    } else {
        List.findOne({name: listName}, (err, foundList) => {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
    
    
    
})

app.post("/delete", (req, res) => {
    // console.log(req.body.checkbox);
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    
    if ( listName === "Today" ) {
        Item.findByIdAndDelete(checkedItemId, err => {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully Deleted");
                res.redirect("/");
            } 
        })
    } else {
        List.findOneAndUpdate( {name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err,doc) => {
                if (!err) {
                    res.redirect("/" + listName);
                }
            }
        );
        
        // Another method
        // List.findOne({name: listName}, (err, foundList) => {
        //     foundList.items.pull({_id: checkedItemId});
        //     foundList.save();
        //     res.redirect("/" + listName);
        // })
        
    }
    
    // Item.deleteOne({_id: checkedItemId}, (err) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log("Successfully Deleted");
    //         res.redirect("/");
    //     }
    // })
    
    
})

// -----------------------------------------------------

app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    
    List.findOne({name: customListName}, (err, result) => {
        if ( !err ) {
            if ( !result ) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                
                list.save();
                res.redirect("/" + customListName);
            } else {
                console.log(result.items);
                res.render("list", { listTitle: customListName, newList: result.items })
            }
        } else {
            console.log(err);
        }
    })
})

// -----------------------------------------------------

app.get("/about", (req, res) => {
    res.render("about");
})

// -----------------------------------------------------
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, () => {
    console.log("Server is started on 3000");
})