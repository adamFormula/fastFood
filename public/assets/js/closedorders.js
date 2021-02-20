//MAIN TABLE tbody object
var tableBody = document
    .getElementById("orders")
    .getElementsByTagName("tbody")[0];

// AJAX
//loading orders data from server
const loadData = () => {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            processData(JSON.parse(this.responseText));
        }
    };
    xhttp.open("GET", "/orders", true);
    xhttp.send();
};

//sending order update to server
const setData = (orderNumber, status) => {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(JSON.parse(this.responseText));
            loadData();
        }
    };
    xhttp.open(
        "GET",
        `/setState?orderNumber=${orderNumber}&state=${status}`,
        true
    );
    xhttp.send();
};

//Processing server response
const processData = (response) => {
    // console.log(response.length);
    let tblOrdersLen = getTableLength();
    response = removeOldOrders(response)
    if (response.length > tblOrdersLen) {
        response.forEach((element) => {
            if (element.number > tblOrdersLen)
                addOrder(element);
        });
    } else if (response.length < tblOrdersLen) {
        clearTable()
        response.forEach((element) => {
            if (element.number > tblOrdersLen)
                addOrder(element);
        });
    }
    updateOrders(response);
};

//Clear all table rows
const clearTable = () => {
    tableBody.innerHTML = ''
}

//Filtering old orders
const removeOldOrders = (data, age = 7200000) => {
    let response = []
    let date = new Date();
    data.forEach((element) => {
        if (element.state == 'paid') {
            response.push(element)
        }
    })
    return response
}

//adding order to tbody
const addOrder = (order) => {
    let states = ["ordered", "canceled", "paid"];
    let row = tableBody.insertRow();
    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    let orderNumber = row.insertCell(0);
    let tableNumber = row.insertCell(1);
    let items = row.insertCell(2);
    let status = row.insertCell(3);
    let actions = row.insertCell(4);

    // Add some text to the new cells:
    orderNumber.innerHTML = `${order.number}`;
    tableNumber.innerHTML = `${order.tableNumber}`;
    items.innerHTML = addItems(order.items);
    items.className = "items";
    status.innerHTML = `${order.state}`;
    status.className = `status ${order.state}`;
    states.forEach((state) => {
        actions.innerHTML += `<a href="#" onclick="setData(${order.number}, '${state}')">
                <button>Mark as ${state}</button>
            </a>`;
    });
};

//adding items to tbody of SINGLE ORDER TD which is a table inside of main table
const addItems = (items) => {
    console.log(items);
    let tbl = document.createElement("table");
    tbl.className = "items";
    tbl.createTHead();
    let header = tbl.createTHead();
    // Create an empty <tr> element and add it to the first position of <thead>:
    let row = header.insertRow();
    let cell = row.insertCell();
    cell.outerHTML = "<th>#</th>";
    cell = row.insertCell();
    cell.outerHTML = "<th>Item</th>";
    cell = row.insertCell();
    cell.outerHTML = "<th>Quantity</th>";
    let tbdy = tbl.createTBody();
    let counter = 0
    for (const [key, value] of Object.entries(items)) {
        if (value) {
            counter++
            row = tbdy.insertRow();
            cell = row.insertCell();
            cell.innerHTML = counter
            cell = row.insertCell();
            cell.innerHTML = key;
            cell = row.insertCell();
            cell.innerHTML = value;
        }
    }
    return tbl.outerHTML;
};

//function filtering orders depending on select value trigerred by onchange event
const filterOrders = (selectObj) => {
    let filter = selectObj.value;
    console.log(filter);
    let rows = document.getElementById("orders").getElementsByTagName("tbody")[0]
        .rows;
    for (row of rows) {
        let cell = row.cells[3];
        if (filter.toLowerCase() == "all") {
            removeClass(row, "hidden");
        } else {
            if (hasClass(cell, filter) && hasClass(row, "hidden")) {
                removeClass(row, "hidden");
            } else if (!hasClass(cell, filter)) {
                addClass(row, "hidden");
            }
        }
    }
};

//returns number of orders currently in table
const getTableLength = () =>
    document.getElementById("orders").getElementsByTagName("tbody")[0].rows
    .length;

//updates all orders statuses
const updateOrders = (orders) => {
    let rows = document.getElementsByClassName("status");
    let counter = 0;
    console.log(orders);
    for (row of rows) {
        console.log(orders[counter])
        if (orders[counter].state != row.innerHTML) {
            row.outerHTML = `<td class="status ${orders[counter].state}">${orders[counter].state}</td>`;
        }
        counter++;
    }
    let select = document.getElementById("filter");
    filterOrders(select);
    let footer = document.getElementById("footer");
    let served = 0,
        cooked = 0,
        ordered = 0,
        paid = 0;
    for (const order of orders) {
        if (order.state == "canceled") {
            canceled++;
        }
        if (order.state == "paid") {
            paid++;
        }
    }
    footer.innerHTML = `Total orders: ${orders.length}\tCanceled: ${canceled}\tPaid: ${paid}`;
};
//shorthands for adding, removing and checking classes
const addClass = (element, cls) => element.classList.add(cls);
const removeClass = (element, cls) => element.classList.remove(cls);
const hasClass = (element, cls) => element.classList.contains(cls);
// initial data load to table via AJAX
loadData();
// reloading data to table at intervals via AJAX
setInterval(() => loadData(), 5000);