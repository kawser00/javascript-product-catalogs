//https://stackoverflow.com/questions/6449611/check-whether-a-value-is-a-number-in-javascript-or-jquery

//selection
const filterInputElem = document.querySelector(".filter");
const productListUl = document.querySelector(".collection");
const msg = document.querySelector(".msg");
const nameInputElem = document.querySelector(".product-name");
const priceInputElem = document.querySelector(".product-price");
const addBtnElem = document.querySelector(".add-btn");
const form = document.querySelector("form");

const getDataFromLocalStorage = () => {
  let items = "";
  if (localStorage.getItem("productItems") === null) {
    items = [];
  } else {
    items = JSON.parse(localStorage.getItem("productItems"));
  }

  return items;
};

const saveDataToLocalStorage = (item) => {
  let items = "";
  if (localStorage.getItem("productItems") === null) {
    items = [];
    items.push(item);
    localStorage.setItem("productItems", JSON.stringify(items));
  } else {
    items = JSON.parse(localStorage.getItem("productItems"));
    items.push(item);
    localStorage.setItem("productItems", JSON.stringify(items));
  }

  return items;
};

const deleteItemFromLocalStorage = (id) => {
  const items = JSON.parse(localStorage.getItem("productItems"));
  let result = items.filter((item) => item.id !== id);
  localStorage.setItem("productItems", JSON.stringify(result));
  if (result.length === 0) location.reload();
};

//data / state (we define all data in separate collection)
// let productData = [];
let productData = getDataFromLocalStorage();

//load all event listener
const loadEventListener = () => {
  form.addEventListener("click", addOrUpdateProduct);
  productListUl.addEventListener("click", UpdateOrDeleteProduct);
  filterInputElem.addEventListener("keyup", filterItem);
  window.addEventListener("DOMContentLoaded", getData.bind(null, productData));
  // when DOM is loaded getData(productData) will call automatically, no need to call getData again;
};

const showMessage = (message = "") => {
  msg.innerText = message;
};

const getData = (productList) => {
  productListUl.innerHTML = "";
  if (productList.length > 0) {
    productList.forEach(({ id, name, price }) => {
      // const { id, name, price } = product;
      let li = document.createElement("li");
      li.className = "list-group-item collection-item";
      li.id = `product-${id}`;
      li.innerHTML = `
        <strong>${name}</strong>-
        <span class="price">$${price}</span>
        <div class="float-end">
          <i class="fas fa-edit lh-base me-2 edit-btn" role="button"></i>
          <i class="fa fa-trash lh-base delete-btn" role="button"></i>
        </div>`;
      productListUl.appendChild(li);
    });
  } else {
    showMessage("Please add item to your catalog");
  }
};
// getData(productData);

const resetInput = () => {
  nameInputElem.value = "";
  priceInputElem.value = "";
};

const resetUI = () => {
  addBtnElem.style.display = "block";
  document.querySelector(".update-btn").remove();
  document.querySelector("#id").remove();
};

//add or update product
const addOrUpdateProduct = (e) => {
  if (e.target.classList.contains("add-btn")) {
    addProduct(e);
  } else if (e.target.classList.contains("update-btn")) {
    updateProduct(e);
    //reset the input
    resetInput();
    //remove update btn
    resetUI();
  }
};

const updateProduct = (e) => {
  const name = nameInputElem.value;
  const price = priceInputElem.value;

  //find the id
  const id = parseInt(e.target.previousElementSibling.value, 10);
  //update the data source
  const updatedProduct = productData.map((product) => {
    if (product.id === id) {
      //update product
      return {
        ...product, // ...products mane - arry er baki sob kichu jemon id, ba onno product unchanged thakbe, just 'name' and 'price' ta update hoye new modify array return korbe
        name,
        price,
      };
    } else {
      return product;
    }
  });

  //DATA LEVEL UPDATES
  productData = updatedProduct; // updated our main source by this updatedProduct array;
  //UPDATES INTO LOCAL STORAGE
  localStorage.setItem("productItems", JSON.stringify(productData));
  //UI LEVEL UPDATES
  getData(productData);
};

//add item to the store and UI
const addProduct = (e) => {
  e.preventDefault();
  const name = nameInputElem.value;
  const price = priceInputElem.value;
  let id;
  if (productData.length === 0) {
    id = 0;
  } else {
    id = productData[productData.length - 1].id + 1;
  }
  //https://stackoverflow.com/questions/6449611/check-whether-a-value-is-a-number-in-javascript-or-jquery
  if (
    name === "" ||
    price === "" ||
    !(!isNaN(parseFloat(price)) && isFinite(price))
  ) {
    alert("Please enter valid information");
    nameInputElem.value = "";
    priceInputElem.value = "";
  } else {
    const data = {
      id,
      name,
      price,
    };
    productData.push(data);
    saveDataToLocalStorage(data);
    productListUl.innerHTML = "";
    getData(productData);
    resetInput();
    msg.innerText = "";
  }
};

//found item
const findProduct = (id) => {
  return productData.find((product) => product.id === id);
};

const populateEditForm = (product) => {
  nameInputElem.value = product.name;
  priceInputElem.value = product.price;

  //id element
  const idElem = `<input type="hidden" id="id" value=${product.id}>`;

  //update submit button
  const btnElem = `<button type="button" class="btn btn-info update-btn w-100 mt-2 text-white">Update</button>`;

  if (document.querySelector("#id")) {
    document.querySelector("#id").setAttribute("value", product.id);
  } // if we have hidden id input then if we click another item that time hidden input value will be changed by this clicked item

  if (!document.querySelector(".update-btn")) {
    document.forms[0].insertAdjacentHTML("beforeend", idElem);
    document.forms[0].insertAdjacentHTML("beforeend", btnElem);
  } // if we already have update button then it will not show again

  //hide submit button
  addBtnElem.style.display = "none";
};

//delete item from UI and store
const UpdateOrDeleteProduct = (e) => {
  if (e.target.classList.contains("delete-btn")) {
    // REMOVING ITEM FORM UI
    const target = e.target.parentElement.parentElement;
    // target.remove(); // delete by itself
    productListUl.removeChild(target); // delete from parentNode

    // GETTING ID
    const id = parseInt(target.id.split("-")[1]);
    deleteItemFromLocalStorage(id);

    //REMOVING ITEM FORM THE STORE
    const filteredProduct = productData.filter((product) => {
      return product.id !== id;
    });
    productData = filteredProduct;
  } else if (e.target.classList.contains("edit-btn")) {
    // FINDING ID FORM UI
    const target = e.target.parentElement.parentElement;
    // GETTING ID
    const id = parseInt(target.id.split("-")[1]);
    //FIND THE PRODUCT
    const foundProduct = findProduct(id);
    //POPULATE TO THE UI FORM
    populateEditForm(foundProduct);
  }
};

// filter item form product lists
const filterItem = (e) => {
  const text = e.target.value.toLowerCase();
  let itemLength = 0;
  document.querySelectorAll(".collection .collection-item").forEach((item) => {
    const productName = item.firstElementChild.innerText.toLowerCase();
    if (productName.indexOf(text) === -1) {
      item.style.display = "none";
    } else {
      item.style.display = "block";
      ++itemLength;
    }
  });

  itemLength > 0 ? showMessage() : showMessage("No item Found");
};

//call event listener
loadEventListener();
