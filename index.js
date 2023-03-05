const express = require('express')
const cors = require('cors')
const server = express()
const dataservice = require('./services/dataService') //import dataService
const jwt = require('jsonwebtoken') //import json web token


server.use(cors({
    origin:'http://localhost:4200'
}))

//to parse json data
server.use(express.json())

server.listen(3000,()=>{
    console.log('server started at 3000');
})

//token verify middleware
const jwtMiddleware = (req,res,next) =>{
    //get token from request headers
    const token = req.headers['access-token']
    try{
        //verify token
        const verify_token = jwt.verify(token,'secretsuperkey')
        // req.frmAcno = verify_token.currentAcno
        next()
    }
    catch{
        res.status(401).json({
            message:'please login'
        })
    }
}

//register api call
server.post('/register',(req,res)=>{
    dataservice.register(req.body.name,req.body.email, req.body.phone, req.body.pswd).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})
//login api call
server.post('/login', (req,res)=>{
    dataservice.login(req.body.phone, req.body.pswd).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

//all product api call
server.get('/all_products',(req,res)=>{
    dataservice.getAllProducts().then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

//get a particular product api call
server.get('/view_product/:productId',(req,res)=>{
    dataservice.getProduct(req.params.productId).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

//add to wishlist api
server.post('/add_to_wishlist',(req,res)=>{
    dataservice.addWishlist(req.body.userId,req.body.product).then((result)=>{
        res.status(result.statusCode).json(result)

    })
})

//all product in wishlist api call
server.get('/wishlist/:userId',(req,res)=>{
    dataservice.getWishlist(req.params.userId).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

//delete item in wishlist api call
server.delete('/delete_from_wishlist/:productId',(req,res)=>{
    dataservice.deleteWishlistItem(req.headers['id'], req.params.productId).then((result)=>{
        res.status(result.statusCode).json(result)

    })
})

//add to cart api
server.post('/add_to_cart',(req,res)=>{
    dataservice.addCart(req.body.userId,req.body.product).then((result)=>{
        res.status(result.statusCode).json(result)

    })
})

//all product in cart api call
server.get('/cart/:userId',(req,res)=>{
    dataservice.getCart(req.params.userId).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

//delete item in cart api call
server.delete('/delete_from_cart/:productId',(req,res)=>{
    dataservice.deleteCartItem(req.headers['id'], req.params.productId).then((result)=>{
        res.status(result.statusCode).json(result)

    })
})

//increment quantity api
server.post('/add_quantity',(req,res)=>{
    dataservice.addQuantity(req.body.userId,req.body.productId).then((result)=>{
        res.status(result.statusCode).json(result)

    })
})

//decrement quantity api
server.post('/reduce_quantity',(req,res)=>{
    dataservice.reduceQuantity(req.body.userId,req.body.productId).then((result)=>{
        res.status(result.statusCode).json(result)

    })
})

//ship address api call
server.post('/add_shipping',(req,res)=>{
    dataservice.addShipAddress(req.body.userId,req.body.name,req.body.phone, req.body.addr, req.body.place,req.body.zip,req.body.ordId).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

// cart api call
server.post('/invoice',(req,res)=>{
    console.log("backend");
    dataservice.invoice(req.body.userId, req.body.ordId).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

// cart api call
server.get('/orders/:userId',(req,res)=>{
    dataservice.getOrders(req.params.userId).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})