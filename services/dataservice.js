const db = require('./db')
const jwt = require('jsonwebtoken')

//function for tax
const taxTotal = (amt)=>{
    let taxCost 
    if(amt >= 200){
      taxCost = Number(((amt*12)/100).toFixed(2))
    }
    else if(amt<200 && amt>100){
      taxCost = Number(((amt*8)/100).toFixed(2))
    }
    else{
      taxCost = Number(((amt*4)/100).toFixed(2))
    }
    return taxCost
  }
//function for discount
const discount = (amt)=>{
    let discCost  
    if(amt >= 200){
      discCost = Number(((amt*35)/100).toFixed(2))
    }
    else if(amt<200 && amt>100){
      discCost = Number(((amt*20)/100).toFixed(2))
    }
    else{
      discCost = Number(((amt*10)/100).toFixed(2))
    }
    return discCost
  }

//function for grant total
const grantotal = (tp,sp,taxp,dp)=>{
    let total = Number(((tp+sp+taxp)-dp).toFixed(2))
    return total
  }

//register
const register =(name,email,phone,pswd)=>{
    //check account is in mongodb
    let counterValue;
    return db.User.findOne({phone}).then((data)=>{
        if(data){
            //account already exist
            return {
                statusCode:403,//due to user error
                message:'Account already exist!!'
            }
        }
        else{
            db.Counter.findOneAndUpdate(
                {seqname:"idcounter"},
                {"$inc":{"seqvalue":1}},
                {new:true}
            ).then((counter)=>{
                if(counter == null){
                    const newCounter = new db.Counter({
                        seqname:"idcounter",
                        seqvalue:1
                        })
                        newCounter.save()
                        counterValue=1
                }
                else{
                    counterValue = counter.seqvalue
                }

                 //to add new user
                const newUser = new db.User({
                    id:counterValue,
                    name:name,
                    email:email,
                    phone:phone,
                    password:pswd
            })
            //to save new user in mongoDB
            newUser.save()
            })
           
            return {
                statusCode:200,
                message:'Registration successful'
            }
        }
    })
}

//login
const login =(phone,pswd)=>{
    //check phone and pswd in mongodb
    return db.User.findOne({
        phone:phone,
        password:pswd
    }).then((result)=>{
        if(result){
            //generate token
            const token = jwt.sign({phoneNum:phone},'secretsuperkey')
            return {
                statusCode:200,
                message:'Login successful!!',
                name:result.name,
               // phone:phone,
                id:result.id,
                token
            }
        }
        else{
            return {
                statusCode:404,
                message:'Invalid credentials!!'
            }
        }
    })
}

//get all products
const getAllProducts = ()=>{
    return db.Product.find().then((result)=>{
        if(result){
            return {
                statusCode: 200,
                products: result
            }
        }
        else{
            return {
                statusCode: 404,
                message: 'No products to show'
            }
        }
    })
}


//get a product
const getProduct = (id)=>{
    return db.Product.findOne({id}).then((result)=>{
        if(result){
            return {
                statusCode: 200,
                product: result
            }
        }
        else{
            return {
                statusCode: 404,
                message: 'No product is available'
            }
        }
    })
}

//add to wishlist
const addWishlist = (id, product)=>{
    return db.User.findOne({id}).then((result)=>{
        if(result){
          if(result.wishlist.find(item=>item.id==product.id)){
            return{
                statusCode: 401,
                message: "Item already in wishlist"
            }
          }
          else{
            result.wishlist.push({
                id:product.id,
                title:product.title,
                price:product.price,
                image:product.image,
                rating:{
                    rate:product.rating.rate,
                    count:product.rating.count
                }
            })
            result.save()
            return {
                statusCode: 200,
                message: "Item added to wishlist"
            }
          }
            
        }
        else{
            return {
                statusCode: 404,
                message: 'Not a user'
            }
        }
    })
}

//get wishlist
const getWishlist =(id)=>{
    return db.User.findOne({
        id
    }).then((result)=>{
        if(result){
            if(result.wishlist.length == 0){
                return {
                    statusCode:401,
                    message:"No items in your wishlist"
                }
            }
           else{
            return {
                statusCode:200,
                wishlist:result.wishlist
            }
           
           }
        }
        else{
            return {
                statusCode:404,
                message:"Not logged in"
            }
        }
    })
}

//delete wishlist item
const deleteWishlistItem = (id, productId)=>{
    
    return db.User.findOne({id}).then((result)=>{
        if(result){
            let index=result.wishlist.findIndex(item=>item.id==productId)
            let val = result.wishlist.splice(index,1)
            result.save()
          if(val){
            if(result.wishlist.length == 0){
                return {
                    statusCode:401,
                    message:"No items in your wishlist"
                }
            }
            else{
                return {
                    statusCode:200,
                    wishlist:result.wishlist
                }
                }
          }
          else{
            
            return {
                statusCode: 401,
                message: "No item found"
            }
          }
            
        }
        else{
            return {
                statusCode: 404,
                message: 'Not a user'
            }
        }
    })
}

//add to cart
const addCart = (uid, product)=>{
    return db.Cart.find({id:uid}).then((result)=>{
        if(result){
            let f = result.find(item=>item.payment=='not')
            if(f){
                if(f.productList.find(item=>item.id==product.id)){
                    return{
                        statusCode: 401,
                        message: "Item already in cart"
                    }
                  }
                  else{
                    f.productList.push({
                        id:product.id,
                        title:product.title,
                        price:product.price,
                        image:product.image,
                        quantity:1,
                        totalCost:product.price
                    })
                    let newtotalCost =0
                    f.productList.map(item=>{
                        newtotalCost += item.price*item.quantity
                    })
                    let tQuantity =0
                    f.productList.map(item=>{
                        tQuantity += item.quantity
                    })
                    let ptax= taxTotal(newtotalCost)
                    let pdisc=  discount(newtotalCost)
                    let sp =0
                    if(newtotalCost<50 ){
                        sp += 5
                    }
                    f.totalQuantity=  tQuantity
                    f.totalPrice= Number(newtotalCost.toFixed(2))
                    f.tax= ptax
                    f.discount= pdisc
                    f.shippingCost= sp
                    f.grantTotal= grantotal(newtotalCost,sp,ptax,pdisc)
                    f.save()
                    return {
                        statusCode: 200,
                        message: "Item added to cart"
                    }
                  }
            }   
            else{
                //to add new cart
            let ptax= taxTotal(product.price)
            let pdisc=  discount(product.price)
            let sp =0
                    if(product.price<50 ){
                        sp += 5
                    }
            let gtotal = grantotal(product.price,sp,ptax,pdisc)
            const newCart = new db.Cart({
                id:uid,
                productList:{
                    id:product.id,
                    title:product.title,
                    price:product.price,
                    image:product.image,
                    quantity:1,
                    totalCost:product.price
                },
                totalQuantity: 1,
                totalPrice: product.price,
                tax: ptax,
                discount: pdisc,
                shippingCost: sp,
                grantTotal: gtotal,
                payment: 'not'

        })
        //to save new cart in mongoDB
        newCart.save()
            return {
                statusCode: 200,
                message: "Item added to cart"
            }
            }        
        }
        else{
            //to add new cart
            let ptax= taxTotal(product.price)
            let pdisc=  discount(product.price)
            let sp =0
            if(product.price<50 ){
                sp += 5
            }
            let gtotal = grantotal(product.price,sp,ptax,pdisc)
            const newCart = new db.Cart({
                id:uid,
                productList:{
                    id:product.id,
                    title:product.title,
                    price:product.price,
                    image:product.image,
                    quantity:1,
                    totalCost:product.price
                },
                totalQuantity: 1,
                totalPrice: product.price,
                tax: ptax,
                discount: pdisc,
                shippingCost: sp,
                grantTotal: gtotal,
                payment: 'not'

        })
        //to save new cart in mongoDB
        newCart.save()
            return {
                statusCode: 200,
                message: "Item added to cart"
            }
        }
    })
}


//get cart
const getCart =(uid)=>{
    return db.Cart.findOne({
        id:uid,
        payment:'not'
    }).then((result)=>{
        if(result){
            if(result.productList.length == 0){
                return {
                    statusCode:401,
                    message:"No items in your cart"
                }
            }
           else{
            return {
                statusCode:200,
                cart:result.productList,
                tquantity:result.totalQuantity,
                totalCost:result.totalPrice,
                totalTax:result.tax,
                tdiscount:result.discount,
                sCost:result.shippingCost,
                grantprice:result.grantTotal,
                shipadr:result.shippingAddr,
                orderId:result._id
            }
           
           }
        }
        else{
            return {
                statusCode:401,
                tquantity:0,
                message:"No items in your cart"
            }
        }
    })
}

//delete cart item
const deleteCartItem = (uid, productId)=>{
    
    return db.Cart.findOne({id:uid, payment:'not'}).then((result)=>{
        if(result){
            let index=result.productList.findIndex(item=>item.id==productId)
            let val
            if(result.productList.length >1){
                let singletotalAmt = result.productList[index].totalCost
                let totalAmt =Number((result.totalPrice - singletotalAmt).toFixed(2))
                let ptax= taxTotal(totalAmt)
                let pdisc=  discount(totalAmt)
                let gtotal = grantotal(totalAmt,result.shippingCost,ptax,pdisc)
                result.totalQuantity -= result.productList[index].quantity
                result.totalPrice= totalAmt
                result.tax= ptax,
                result.discount=pdisc
                result.grantTotal= gtotal
                val = result.productList.splice(index,1)
                result.save()
            }   
            else{
                val = result.productList.splice(index,1)
                result.totalQuantity =0
                result.totalPrice= 0
                result.tax= 0,
                result.discount=0
                result.grantTotal= 0
                result.save()
            }   
              if(val){
                if(result.productList.length == 0){
                    return {
                        statusCode:401,
                        message:"No items in your cart"
                    }
                }
                else{
                    return {
                        statusCode:200,
                        cart:result.productList,
                        tquantity:result.totalQuantity,
                        totalCost:result.totalPrice,
                        totalTax:result.tax,
                        tdiscount:result.discount,
                        sCost:result.shippingCost,
                        grantprice:result.grantTotal
                    }
                    }
              }
              else{
                
                return {
                    statusCode: 401,
                    message: "No item found"
                }
              }     
        }
        else{
            return {
                statusCode: 404,
                message: 'Not a user'
            }
        }
    })
}

//add quantity to cart
const addQuantity = (uid, pid)=>{
    return db.Cart.findOne({id:uid, payment:'not'}).then((data)=>{
        if(data){
            let index=data.productList.findIndex(item=>item.id==pid)
            let newQuantity = data.productList.find(item=>item.id==pid).quantity
            let productPrice = data.productList.find(item=>item.id==pid).price
            let newTotalPrice =data.totalPrice + productPrice
            let sp=0
            if(newTotalPrice < 50){
                sp += 5
            }
            let ptax= taxTotal(newTotalPrice)
            let pdisc=  discount(newTotalPrice)
            let gtotal = grantotal(newTotalPrice,sp,ptax,pdisc)
            data.totalQuantity += 1
            data.totalPrice = Number(newTotalPrice).toFixed(2)
            data.shippingCost = sp
            data.tax= ptax
            data.discount=pdisc
            data.grantTotal= gtotal
            data.productList[index]['quantity'] += 1
            data.productList[index]['totalCost'] +=productPrice
            data.save()

             newQuantity += 1
            let newtotalCost = Number(productPrice * newQuantity).toFixed(2)
      
             db.Cart.findOneAndUpdate(
                  { 
                      id:uid,
                      payment:'not',
                      "productList.id":pid
                  },
                  { $set:{
                     'productList.$.quantity': newQuantity,
                     'productList.$.totalCost': newtotalCost
                  }
                  },
                  {new: true}
               ).then((result)=>{
               })
            //    data.save()
            // console.log(data);
               return {
                statusCode:200,
                    cart:data.productList,
                    tquantity:data.totalQuantity,
                    totalCost:data.totalPrice,
                    totalTax:data.tax,
                    tdiscount:data.discount,
                    sCost:data.shippingCost,
                    grantprice:data.grantTotal
            }
             
        }
        else{
            return {
                statusCode: 404,
                message: 'Not a user'
            }
        }
    })
    
        
}

//reduce quantity to cart
const reduceQuantity = (uid, pid)=>{
    return db.Cart.findOne({id:uid, payment:'not'}).then((data)=>{
        if(data){
            let index=data.productList.findIndex(item=>item.id==pid)
            let newQuantity = data.productList.find(item=>item.id==pid).quantity
            if(newQuantity>1){
                let productPrice = data.productList.find(item=>item.id==pid).price
                let newTotalPrice =data.totalPrice - productPrice
                let ptax= taxTotal(newTotalPrice)
                let pdisc=  discount(newTotalPrice)
                let sp=0
                if(newTotalPrice < 50){
                    sp += 5
                }
                let gtotal = grantotal(newTotalPrice,sp,ptax,pdisc)
                data.totalQuantity -= 1
                data.totalPrice = Number(newTotalPrice).toFixed(2)
                data.shippingCost = sp
                data.tax= ptax
                data.discount=pdisc
                data.grantTotal= gtotal
                data.productList[index]['quantity'] -= 1
                data.productList[index]['totalCost'] -=productPrice
                data.save()

                newQuantity -= 1
                let newtotalCost = Number(productPrice * newQuantity).toFixed(2)
        
                db.Cart.findOneAndUpdate(
                    { 
                        id:uid,
                        payment:'not',
                        "productList.id":pid
                    },
                    { $set:{
                        'productList.$.quantity': newQuantity,
                        'productList.$.totalCost': newtotalCost
                    }
                    },
                    {new: true}
                ).then((result)=>{
                })
                return {
                    statusCode:200,
                        cart:data.productList,
                        tquantity:data.totalQuantity,
                        totalCost:data.totalPrice,
                        totalTax:data.tax,
                        tdiscount:data.discount,
                        sCost:data.shippingCost,
                        grantprice:data.grantTotal
                }

            }
            else{
                return{
                    statusCode:200
                }

            }
        }
        else{
            return {
                statusCode: 404,
                message: 'Not a user'
            }
        }
    })
}

//get a invoice
const addShipAddress = (uid,name,phone,addr,place,zip,oid)=>{
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const orderdate = dd + '-' + mm + '-' + yyyy;

    return db.Cart.findOne({
         id:uid,
         payment:'not'
        }).then((result)=>{
        if(result){
            // db.User.findOne({id:uid}).then((data)=>{
            //     data.orders.push({
            //         orderId:oid,
            //         products:result.productList,
            //         date:orderdate,
            //         shipAddress:[{
            //             name:name,
            //             phone:phone,
            //             address:addr,
            //             place:place,
            //             zip:zip
            //         }],
            //         totalQuantity: result.totalQuantity,
            //         totalPrice: result.totalPrice,
            //         tax: result.tax,
            //         discount: result.discount,
            //         shippingCost: 5,
            //         grantTotal: result.grantTotal
            //     })
            //     data.save()
            // })

            result.shippingAddr.push({
                name:name,
                phone:phone,
                address:addr,
                place:place,
                zip:zip
            })
            result.payment ='payed'
            result.orderId = oid
            result.date = orderdate
            result.save()
            return {
                statusCode: 200,
                message: "Your Payment completed successfully!!!!!"
            }
        }
        else{
            return {
                statusCode: 404,
                message: 'sorry....something went wrong'
            }
        }
    })
}

//get invoice
const getOrders =(uid)=>{
    console.log(uid)
    return db.Cart.find({
        id:uid,
        payment:'payed',
    }).then((result)=>{
        console.log(result)
        if(result){   

            return {
                statusCode:200,
                order:result
            }        
          
        }
        else{
            return {
                statusCode:401,
                message:"You don't have any orders yet"
            }
        }
    })
}

//get orders
const invoice =(uid,ordId)=>{
    return db.Cart.findOne({
        id:uid,
        orderId:ordId,
        payment:'payed',
    }).then((result)=>{
        if(result){           
            return {
                statusCode:200,
                cart:result.productList,
                tquantity:result.totalQuantity,
                totalCost:result.totalPrice,
                totalTax:result.tax,
                tdiscount:result.discount,
                sCost:result.shippingCost,
                grantprice:result.grantTotal,
                shipadr:result.shippingAddr,
                orderId:result._id,
                date:result.date
            }        
          
        }
        else{
            return {
                statusCode:401,
                tquantity:0,
                message:"Not yey paid"
            }
        }
    })
}
//export
module.exports ={
    register,
    login,
    getAllProducts,
    getProduct,
    addWishlist,
    getWishlist,
    deleteWishlistItem,
    addCart,
    getCart,
    deleteCartItem,
    addQuantity,
    reduceQuantity,
    addShipAddress,
    invoice,
    getOrders
}