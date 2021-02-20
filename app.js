'use strict';
// IMPORTS
//dependencies
// "dependencies": {
//     "express": "^4.17.1",
//     "jade": "^1.11.0",
//     "path": "^0.12.7"
// }, 
//npm install express
//npm install jade
//npm install path
const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs")

// PORT
const port = 3000;

//DATA LOADING from orders.json
const loadData = () => {
    let data
    let savePath = path.resolve(__dirname, "orders.json")
    try {
        data = JSON.parse(fs.readFileSync(savePath, "utf8"));
        if (!data) {
            console.error(`Error loading JSON at ${savePath}`)
            return []
        } else {
            console.log(`Loaded data from JSON at ${savePath}`)
            return data
        }
    } catch (err) {
        console.error(`Error loading JSON at ${savePath}!`)
        console.error(`Error: ${err}!`)
        return []
    }
}

//DATA SAVING of all global.orders to orders.json
const saveData = (data) => {
    let savePath = path.resolve(__dirname, "orders.json")
    fs.writeFile(savePath, JSON.stringify(data, null, '\t'), 'utf8', function(err) {
        if (!err) {
            console.log(`The JSON at ${savePath} has been successfully updated.`)
        } else {
            console.error(`Error writing to ${savePath}!`)
        }
    });
}

// VARIABLES
global.orders = loadData()
global.tokens = [];
const states = ["ordered", "cooked", "served", "paid"];
const foods = {
    bgr: { name: 'BurgerMeal', cls: '', price: 12, txt: 'Burger & Chips' },
    fsh: { name: 'FishMeal', cls: '', price: 15, txt: 'Fish & Chips' },
    las: { name: 'Lasagne', cls: '', price: 12, txt: 'Lasagne' },
    brs: { name: 'Beer', cls: '', price: 2, txt: 'Beer' },
    cks: { name: 'Coke', cls: '', price: 1, txt: 'Coke' }
}
const tblHdr = ['Item', 'Quantity', 'Price', 'Line Total']
loadData()

// EXPRESS
app.set("views", __dirname + "/views");
app.set("view engine", "jade");
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/setState", (req, res) => {
    setOrderState(req, res);
});

app.get("/makeorder", (req, res) => {
    res.render("makeorder", { foods: foods, tblHdr: tblHdr });
});

app.get("/orderStatus", (req, res) => {
    let number = req.query["ordernumber"];
    let order = global.orders[number - 1];
    let queue = 0;
    for (const order of global.orders) {
        if (order.state == "ordered" || order.state == "cooked") {
            queue++;
        }
    }
    res.render('status', { orderNumber: order.number, orderStatus: order.state, orderQueue: queue - 1, orderSuccess: true });
});

app.post("/PlaceOrder", (req, res) => {
    let order = {};
    let date = new Date()
        // console.log(req.body)
    order.state = "ordered";
    order.orderedDate = date.valueOf()
    order.cookedDate = ''
    order.servedDate = ''
    order.paidDate = ''
    order.tableNumber = parseInt(req.body["tableNumber"]);
    delete req.body.tableNumber;
    order.items = convertObjParToInt(req.body);
    order.number = global.orders.length + 1; //Note, the order number is 1 more than the orders index in the array (becuase we don't want an order #0)
    order.lineTotal = {
        [foods.bgr.name]: foods.bgr.price * order.items[foods.bgr.name],
        [foods.fsh.name]: foods.fsh.price * order.items[foods.fsh.name],
        [foods.las.name]: foods.las.price * order.items[foods.las.name],
        [foods.brs.name]: foods.brs.price * order.items[foods.brs.name],
        [foods.cks.name]: foods.cks.price * order.items[foods.cks.name],
    };
    order.orderTotal = Object.values(order.lineTotal).reduce((partial_sum, a) => partial_sum + a, 0)
    global.orders.push(order);
    global.tokens.push(order.number);
    let queue = 0;
    for (const order of global.orders) {
        if (order.state != "served" || order.state != "paid") {
            queue++;
        }
    }
    const index = global.tokens.indexOf(order.number);
    if (index > -1) {
        global.tokens.splice(index, 1);
    }
    saveData(global.orders)
    return res.render("orderaccepted", { orderNumber: order.number, orderStatus: order.state, orderSuccess: true, orderQueue: queue - 1 });
});

app.get("/manageorders", (req, res) => {
    res.render("manageorders", { statuses: states });
});

app.get("/closedorders", (req, res) => {
    res.render("closedorders", { statuses: states });
});

app.get("/orders", (req, res) => {
    res.send(global.orders);
});

const setOrderState = (req, res) => {
    let order = global.orders[parseInt(req.query["orderNumber"]) - 1];
    let date = new Date()
    order.state = req.query["state"];
    order[`${order.state}Date`] = date.valueOf()
    saveData(global.orders)
    res.status(200).json({ status: "OK" });
};

const convertObjParToInt = (obj) => {
    const res = {}
    for (const [item, qty] of Object.entries(obj)) {
        if (qty)
            res[item] = parseInt(qty)
        else res[item] = 0
    }
    return res
}