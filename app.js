const http = require("http");
const fs = require("fs");
const path = require("path");

const dataFilePath = path.join(__dirname, "productsData.json");

function readProducts() {
  let rawData = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(rawData);
}

function writeProducts(products) {
  fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2));
}

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/products" && req.method === "GET") {
    let products = readProducts();
    res.end(JSON.stringify(products));

  } else if (req.method === "GET" && req.url.startsWith("/product/")) {
    let products = readProducts();
    let id = +req.url.split("/")[2];
    let product = products.find((item) => item.id === id);
    if (product) {
      res.end(JSON.stringify(product));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "No product found with this ID" }));
    }

  } else if (req.method === "POST" && req.url === "/addProduct") {
    let products = readProducts();
    let reqBody = "";
    req.on("data", (chunk) => {
      reqBody += chunk;
    });
    req.on("end", () => {
      let newProduct = JSON.parse(reqBody);
      newProduct.id = products.length ? products[products.length - 1].id + 1 : 1;
      products.push(newProduct);
      writeProducts(products);
      res.statusCode = 201;
      res.end(JSON.stringify({ message: "Product added successfully", product: newProduct }));
    });

  } else if (req.method === "PUT" && req.url.startsWith("/product/")) {
    let products = readProducts();
    let id = +req.url.split("/")[2];
    let productIndex = products.findIndex((item) => item.id === id);

    if (productIndex === -1) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Product not found" }));
      return;
    }

    let reqBody = "";
    req.on("data", (chunk) => {
      reqBody += chunk;
    });
    req.on("end", () => {
      let updatedData = JSON.parse(reqBody);
      products[productIndex] = { ...products[productIndex], ...updatedData };
      writeProducts(products);
      res.end(JSON.stringify({ message: "Product updated successfully", product: products[productIndex] }));
    });

  } else if (req.method === "DELETE" && req.url.startsWith("/product/")) {
    let products = readProducts();
    let id = +req.url.split("/")[2];
    let productIndex = products.findIndex((item) => item.id === id);

    if (productIndex === -1) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Product not found" }));
      return;
    }

    let deletedProduct = products.splice(productIndex, 1);
    writeProducts(products);
    res.end(JSON.stringify({ message: "Product deleted successfully", product: deletedProduct[0] }));

  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

server.listen(3000, () => {
  console.log("Server Connected on port 3000");
});
