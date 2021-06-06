var stripeElements = function(publicKey, setupIntent) {
  var stripe = Stripe(publicKey);
  var elements = stripe.elements();
  console.log(setupIntent.data.client_secret);
  // Element styles
  var style = {
    base: {
      fontSize: "16px",
      color: "#32325d",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
      fontSmoothing: "antialiased",
      "::placeholder": {
        color: "rgba(0,0,0,0.4)"
      }
    }
  };

  var card = elements.create("card", { style: style });

  card.mount("#card-element");

  // Element focus ring
  card.on("focus", function() {
    var el = document.getElementById("card-element");
    el.classList.add("focused");
  });

  card.on("blur", function() {
    var el = document.getElementById("card-element");
    el.classList.remove("focused");
  });

  // Handle payment submission when user clicks the pay button.
  var button = document.getElementById("submit");
  button.addEventListener("click", function(event) {
    event.preventDefault();
    changeLoadingState(true);
    var email = document.getElementById("email").value;

    stripe
      .confirmCardSetup(setupIntent.data.client_secret, {
        payment_method: {
          card: card,
          billing_details: { email: email }
        }
      })
      .then(function(result) {
        if (result.error) {
          changeLoadingState(false);
          var displayError = document.getElementById("card-errors");
          displayError.textContent = result.error.message;
        } else {
          // The PaymentMethod was successfully set up
          orderComplete(stripe, setupIntent.data.client_secret);
        }
      });
  });
};

// should retrieve company_id of current user
var company_id = 1000004;

var getSetupIntent = function(publicKey) {
  return fetch("http://localhost:8000/payment/v1/" + company_id + "/stripe/card/intent", {
    method: "get",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(setupIntent) {
      stripeElements(publicKey, setupIntent);
    });
};

var getPublicKey = function() {
  // return fetch("/public-key", {
  //   method: "get",
  //   headers: {
  //     "Content-Type": "application/json"
  //   }
  // })
  //   .then(function(response) {
  //     return response.json();
  //   })
  //   .then(function(response) {
  //     getSetupIntent(response.publicKey);
  //   });

  getSetupIntent('pk_test_51HQcEgCTy2hUXuvMeOcx8YHfXipisxPYGY6hondsTFMkAFvBTxdMBUrw3FEyHG0xfb1t8LI9TKSW708486Sfacx100gcWI1nYW');

};

// Show a spinner on payment submission
var changeLoadingState = function(isLoading) {
  if (isLoading) {
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
};

/* Shows a success / error message when the payment is complete */
var orderComplete = function(stripe, clientSecret) {
  stripe.retrieveSetupIntent(clientSecret).then(function(result) {
    var setupIntent = result.setupIntent;
    var setupIntentJson = JSON.stringify(setupIntent, null, 2);

    document.querySelector(".sr-payment-form").classList.add("hidden");
    document.querySelector(".sr-result").classList.remove("hidden");
    document.querySelector("pre").textContent = setupIntentJson;
    setTimeout(function() {
      document.querySelector(".sr-result").classList.add("expand");
    }, 200);

    console.log(setupIntentJson);
    changeLoadingState(false);
  });

};

getPublicKey();
