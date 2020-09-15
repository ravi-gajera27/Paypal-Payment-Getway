const express = require("express");
const ejs = require("ejs");
const path = require("path");
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox",
  client_id:
    "AUh5IuAWgKB3OFiSYxb8-ACLzc8Lda03jTBEZn78o3EmwyyGvV3nQoxGaAKQLI0KVgFAQyEV1MRKjXM0",
  client_secret:
    "EP4vBdNNpxWVM1d3vkzxO5xHacybjZ4Rhtb4wGkQgIytGJUmfkPJKwD-DMimgdXPhKzZGO6mogqZ-1yZ",
});

const app = express();
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("customer");
});

app.get("/cancel", (req, res) => {
  res.render("cancel");
});

app.get("/success_page", (req, res) => {
  res.render("success");
});

app.get("/payment", (req, res) => {
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    },
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "12.00",
          details: {
            shipping: "2.00",
            subtotal: "10.00",
          },
        },
        item_list: {
          items: [
            {
              name: "Cricket Bat",
              currency: "USD",
              sku: "123",
              quantity: "1",
              price: "10.00",
            },
          ],
        },
        description: "Payment description",
      },
    ],
  };
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      res.send("cancel");
      throw error;
    } else {
      for (var i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  var execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "25.00",
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
    if (error) {
      res.redirect("cancel");
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.redirect("success_page");
    }
  });
});
app.listen(3000, () => {
  console.log("app is running on port 3000");
});
