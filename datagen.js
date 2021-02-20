//run once to create dummy data of choosen size (samples)

const fs = require("fs");
const path = require("path");
let states = ["ordered", "cooked", "served", "paid"];
const foods = {
    bgr: { name: "BurgerMeal", price: 12, txt: "Burger & Chips" },
    fsh: { name: "FishMeal", price: 15, txt: "Fish & Chips" },
    las: { name: "Lasagne", price: 12, txt: "Lasagne" },
    brs: { name: "Beer", price: 2, txt: "Beer" },
    cks: { name: "Coke", price: 1, txt: "Coke" },
};
let samples = 2400; //number of generated dummy orders
let workingHoursPerDay = 10; // amount of working hours per day
let workStartHour = 8; //hour when work starts
let numberOfDays = 60; //over how many days back

const genNumber = (max) => {
    return parseInt(Math.floor(Math.random() * (max + 1)));
};

const ordersPerDay = (samples) => samples / numberOfDays;

const freq = (dayLimit) => (workingHoursPerDay * 60) / dayLimit;

const getDateMonthBack = () => {
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - numberOfDays + 2)
        // currentDate.setHours(currentDate.getHours() + 5);
    return currentDate;
};

const offsetByHours = (date, hrs) => new Date(date).setHours(date.getHours() + hrs);
const generateData = (freq) => {
    let now = new Date();
    let cooked = new Date();
    let served = new Date();
    let paid = new Date();
    let date = getDateMonthBack();
    date.setHours(workStartHour, 00, 00);
    let data = [];
    for (let index = 0; date < offsetByHours(now, 1); index++) {
        if (date.getHours() == String(workStartHour + workingHoursPerDay)) {
            date.setDate(date.getDate() + 1);
            date.setHours(workStartHour, 00, 00);
        } else {
            if (index != 0) date.setMinutes(date.getMinutes() + freq);
        }
        cooked.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        // console.log(cooked);
        cooked.setHours(date.getHours(), date.getMinutes() + genNumber(12) + 3);
        served.setFullYear(
            cooked.getFullYear(),
            cooked.getMonth(),
            cooked.getDate()
        );
        served.setHours(cooked.getHours(), cooked.getMinutes() + genNumber(12) + 3);
        paid.setFullYear(served.getFullYear(), served.getMonth(), served.getDate());
        paid.setHours(served.getHours(), served.getMinutes() + genNumber(12) + 3);
        let temp = {};
        temp.state =
            now - paid > 0 ?
            states[3] :
            now - served > 0 ?
            states[2] :
            now - cooked > 0 ?
            states[1] :
            states[0];
        temp.tableNumber = genNumber(11) + 1;
        temp.items = {
            [foods.bgr.name]: genNumber(5),
            [foods.fsh.name]: genNumber(5),
            [foods.las.name]: genNumber(5),
            [foods.brs.name]: genNumber(5),
            [foods.cks.name]: genNumber(5),
        };
        temp.lineTotal = {
            [foods.bgr.name]: foods.bgr.price * temp.items[foods.bgr.name],
            [foods.fsh.name]: foods.fsh.price * temp.items[foods.fsh.name],
            [foods.las.name]: foods.las.price * temp.items[foods.las.name],
            [foods.brs.name]: foods.brs.price * temp.items[foods.brs.name],
            [foods.cks.name]: foods.cks.price * temp.items[foods.cks.name],
        };
        temp.orderTotal = Object.values(temp.lineTotal).reduce(
            (partial_sum, a) => partial_sum + a,
            0
        );
        temp.number = index + 1;
        //     temp.orderedDate = `${date
        //   .toLocaleDateString("en-GB")
        //   .replace(/\//g, "-")} ${date.toLocaleTimeString("en-GB")}`;
        //     temp.cookedDate =
        //         now - cooked > 0 ?
        //         `${cooked
        //         .toLocaleDateString("en-GB")
        //         .replace(/\//g, "-")} ${cooked.toLocaleTimeString("en-GB")}` :
        //         "";
        //     temp.servedDate =
        //         now - served > 0 ?
        //         `${served
        //         .toLocaleDateString("en-GB")
        //         .replace(/\//g, "-")} ${served.toLocaleTimeString("en-GB")}` :
        //         "";
        //     temp.paidDate =
        //         now - paid > 0 ?
        //         `${paid
        //         .toLocaleDateString("en-GB")
        //         .replace(/\//g, "-")} ${paid.toLocaleTimeString("en-GB")}` :
        //         "";
        temp.orderedDate = date.valueOf();
        temp.cookedDate =
            now - cooked > 0 ? cooked.valueOf() : "";
        temp.servedDate =
            now - served > 0 ? served.valueOf() : "";
        temp.paidDate =
            now - paid > 0 ? paid.valueOf() : "";
        data.push(temp);
    }
    console.log(`Last date is: ${date}`)
    return data;
};

const saveData = (data) => {
    let savePath = path.resolve(__dirname, "orders.json");
    fs.writeFile(
        savePath,
        JSON.stringify(data, null, "\t"),
        "utf8",
        function(err) {
            if (!err) {
                console.log(`The JSON at ${savePath} has been successfully updated.`);
            } else {
                console.error(`Error writing to ${savePath}!`);
            }
        }
    );
};
let frequency = freq(ordersPerDay(samples));
saveData(generateData(frequency));
console.log(
    `Total of ${samples} orders has been generated.\nOrders were generated every ${frequency} minutes.\nFirst order starting date is:\n${getDateMonthBack().getDate()} ${getDateMonthBack().getMonth()} ${getDateMonthBack().getFullYear()}.`
);