document.getElementById("myButton").addEventListener("click", myFunction);

 function getUrl(textValue) {
     if(textValue === 'hiking') {
         return 'https://www.nike.com/in/w?q=Nike%20ACG%20Air%20Zoom%20Terra%20Kiger%207&vst=Nike%20ACG%20Air%20Zoom%20Terra%20Kiger%207';
     } else if(textValue === 'basketball'){
         return 'https://www.nike.com/in/w?q=Nike%20LeBron%2018&vst=Nike%20LeBron%2018';
     }
     return "https://example.com/";
 }
async function callApi(textValue,discountValue){
    if(textValue)
    {
        const url = getUrl(textValue);
        const payload = {
            keyword: textValue,
            url: url,
            discount: discountValue ? discountValue : 0,
        };

        try {
            const response = await fetch("https://288650-257ambermackerel.adobeio-static.net/api/v1/web/brandads/getads", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            return data;
            // console.log(data);
        } catch (error) {
            console.error(error);
        }
    }
}
function changePage(res){
    const newPage = document.createElement("html");
    const newHead = document.createElement("head");
    const newTitle = document.createElement("title");
    newTitle.textContent = "Created campaigns";
    const newStylesheet = document.createElement("link");
    newStylesheet.setAttribute("rel", "stylesheet");
    newStylesheet.setAttribute("href", "styles.css");
    newHead.appendChild(newTitle);
    newHead.appendChild(newStylesheet);

    const newBody = document.createElement("body");
    const container = document.createElement("div");
    container.setAttribute("class", "container");
    const header = document.createElement("h2");
    header.textContent = "Created campaigns, here are their URLs for you to check:";
    const urlsDiv = document.createElement("div");
    urlsDiv.setAttribute("class", "urls");
    const table = document.createElement("table");
    urlsDiv.appendChild(table);

// Add URLs from the response to the new page
    // Add URLs from the response to the new page
    let campaignNumber = 1;
    for (const key in res) {
        //console.log("key is " + key);
        const row1 = document.createElement("tr");
        row1.style.padding = "50px"
        table.appendChild(row1);
        const column11 = document.createElement("td");
        row1.appendChild(column11);
        column11.textContent = `Campaign ${campaignNumber}: `;
        column11.colSpan = 2;


        const row2 = document.createElement("tr");
        row2.style.padding = "50px"
        table.appendChild(row2);
        const column21 = document.createElement("td");
        row2.appendChild(column21);
        column21.textContent = "Original Url:";
        const column22 = document.createElement("td");
        row2.appendChild(column22);
        const orginalUrlLink1 = document.createElement("a");
        orginalUrlLink1.href = res[key]["liveurl"];
        orginalUrlLink1.target = "_blank";
        orginalUrlLink1.rel = "noopener noreferrer";
        orginalUrlLink1.appendChild(document.createTextNode(res[key]["liveurl"]));
        column22.appendChild(orginalUrlLink1)




        const row3 = document.createElement("tr");
        row3.style.padding = "50px"
        table.appendChild(row3);
        const column31 = document.createElement("td");
        row3.appendChild(column31);
        column31.textContent = "Ad Url:";
        const column32 = document.createElement("td");
        row3.appendChild(column32);
        const orginalUrlLink2 = document.createElement("a");
        orginalUrlLink2.href = res[key]["adurl"];
        orginalUrlLink2.target = "_blank";
        orginalUrlLink2.rel = "noopener noreferrer";
        orginalUrlLink2.appendChild(document.createTextNode(res[key]["adurl"]));
        column32.appendChild(orginalUrlLink2);
        campaignNumber++;







        // const campaignSpan = document.createElement("span");
        // campaignSpan.textContent = `Campaign ${campaignNumber}: `;
        // const orginalurl = document.createElement("p");
        // orginalurl.textContent = "Original Url : "
        // campaignSpan.appendChild(orginalurl);
        //
        //
        // const orginalUrlLink = document.createElement("a");
        // orginalUrlLink.href = res[key]["liveurl"];
        // orginalUrlLink.target = "_blank";
        // orginalUrlLink.rel = "noopener noreferrer";
        // orginalurl.appendChild(orginalUrlLink);
        // orginalUrlLink.appendChild(document.createTextNode(res[key]["liveurl"]));
        //
        // const adUrl = document.createElement("p");
        // adUrl.textContent = "Ad Url : "
        // campaignSpan.appendChild(adUrl);
        //
        //
        // const urlLink = document.createElement("a");
        // urlLink.href = res[key]["adurl"];
        // urlLink.target = "_blank";
        // urlLink.rel = "noopener noreferrer";
        // adUrl.appendChild(urlLink);
        // urlLink.appendChild(document.createTextNode(res[key]["adurl"]));
        // const listItem = document.createElement("li");
        // listItem.appendChild(campaignSpan);
        // urlsDiv.appendChild(listItem);
        // campaignNumber++;
    }


    container.appendChild(header);
    container.appendChild(urlsDiv);
    newBody.appendChild(container);
    newPage.appendChild(newHead);
    newPage.appendChild(newBody);

    // Replace the current page with the new page
    document.open();
    document.write(newPage.outerHTML);
    document.close();
}
async function myFunction(){
    const userInput = document.getElementById("userInput");
    const textValue = userInput.value;
    const discountInput = document.getElementById("discountInput");
    const discountValue = discountInput.value;

    const res = await callApi(textValue,discountValue);
    changePage(res);
}
