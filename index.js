// setup server
const express = require('express');
const app     = express();
module.exports = app;
const low     = require('lowdb');
const fs      = require('lowdb/adapters/FileSync');
const adapter = new fs('db.json');
const db      = low(adapter);
const cors = require('cors');

app.use(cors());
// setup directory used to serve static files
app.use(express.static('public'));
//app.use(cors());

// setup data store
// required data store structure

db.defaults(
{ 
    accounts:[
        {name        : '',
         email       : '',
         balance     : 0,
         password    : '',
         transactions: []}
    ] 
}).write();

// Create basic functions.
var audit=function (action,amount)
{
    var record = 
    {
        action : action,
        amount : amount,
        timestamp: new Date()
    };
    return record;
};


app.get('/account/create/:name/:email/:password', function (req, res) {

    // YOUR CODE
    // Create account route
    // return success or failure string
    var msg ='';
            
    var account = db.get ('accounts')
     .find ({email: req.params.email})
     .value();
       
    if (account){
        msg ='Account Already Exists!';
        res.send(null);
    }
    else{
        db.get ('accounts')
         .push(
            {    name    : req.params.name,
                 email    : req.params.email,
                 password : req.params.password,
                 balance  : 0,
                 transactions : []
            })
         .write ();
         msg ='Account Created!';
         res.send(msg);    
    }
        console.log (msg); 
});

app.get('/account/login/:email/:password', function (req, res) {

    // YOUR CODE
    // Login user - confirm credentials
    // If success, return account object    
    // If fail, return null
    var account = db.get ('accounts')
    .find ({email:req.params.email})
    .value();
 
 if (account){
        if (account.password==req.params.password){
            account.transactions.push(audit('login',0));
            res.send(account);
            console.log(account);
        }
        else{
        res.send(null);
        console.log('Incorrect Password!');
        }
    }

 else {
    res.send(null);
    console.log('Account not Found!');
   }

});

app.get('/account/get/:email', function (req, res) {

    // YOUR CODE
    // Return account based on email
    var account = db.get ('accounts')
     .find ({email: req.params.email})
     .value();
    
     if (account)
        {  
            account.transactions.push(audit('account_check',account));
            console.log (account);
            res.status(200).send(String(account));
        }
    else
        {
            console.log ('Account Not Found!');
            res.send(null);     
        }
});

app.get('/account/deposit/:email/:amount', function (req, res) {

    // YOUR CODE
    // Deposit amount for email
    // return success or failure string
    var account = db.get ('accounts')
     .find ({email: req.params.email})
     .value();    
    if (account){
        account.balance = Number(account.balance) + Number(req.params.amount);
        db.get ('accounts')
         .assign(
            {    
                balance  : account.balance             
            })
         .write ();
        account.transactions.push(audit('deposit',req.params.amount));
        console.log (account);
        res.send(account);
        }

    else {
      console.log ('Account Not Found!');
      res.send(null);     
    }
});

app.get('/account/withdraw/:email/:amount', function (req, res) {

    // YOUR CODE
    // Withdraw amount for email
    // return success or failure string
    var account = db.get ('accounts')
     .find ({email: req.params.email})
     .value();

   if (account) {
      if (account.balance >= req.params.amount)
       {
            account.balance = Number(account.balance) - Number (req.params.amount);
            db.get ('accounts')
            .assign(
                {   
                    balance  : account.balance
                })
            .write ();
            account.transactions.push(audit('withdraw',req.params.amount));
            console.log (account);
            res.send(account);
        }

        else {
           console.log ("Insufficient Balance!");
           console.log (account);
           res.send(null);
        }
   }
  else
   {
      console.log ('Account Not Found!');
      res.send(null);
         
    }
});

app.get('/account/transactions/:email', function (req, res) {

    // YOUR CODE
    // Return all transactions for account
    var account = db.get ('accounts')
     .find ({email: req.params.email})
     .value();       
    if (account)
    {
     res.send(account.transactions);
     console.log(account.transactions);
    }

    else
    {
      console.log ('Account Not Found!');
      res.send(null);
         
    }
});


app.get('/account/balance/:email', function (req, res) {

    var account = db.get ('accounts')
     .find ({email: req.params.email})
     .value();
    
     if (account)
        {  
            account.transactions.push(audit('Balance',account.balance));
            console.log (account.balance);
            res.status(200).send(String(account.balance));
        }
    else
        {
            console.log ('Account Not Found!');
            res.send(null);     
        }
});

app.get('/account/all', function (req, res) {

    // YOUR CODE
    // Return data for all accounts
    var account = db.get('accounts').value();
         
    if (account)
        {
            console.log(account);
            res.send(account);
        }
    else
    {
        console.log ('No Accounts!');
        res.send(null);
    }
});



app.listen(3000, function(){
    console.log('Bad Bank 1.125 Branch running on port 3000!')
 })
