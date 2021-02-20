const recalculate = (selectObj) => {
    //   console.log(selectObj.id);
    let total = 0;
    let tds = document.querySelectorAll('[id$="Total"]');
    let totalObj = document.getElementById("totalSum");
    let priceObj = Number(
        document.getElementById(`${selectObj.id}Price`).innerHTML.replace("£", "")
    );
    let lineObj = document.getElementById(`${selectObj.id}Total`);
    lineObj.innerHTML = "£" + String(priceObj * Number(selectObj.value));
    tds.forEach((lineTotal) => {
        total += Number(lineTotal.innerHTML.replace("£", ""));
    });
    totalObj.innerHTML = `TOTAL: £${String(total)}`;
};