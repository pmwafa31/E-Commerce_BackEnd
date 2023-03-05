const mongoose = require('mongoose')
mongoose.set('strictQuery', false);

//using mongoose define a connection string
mongoose.connect('mongodb://localhost:27017/ecommerceDB',()=>{
    console.log('mongo db connected successfully');
})

//model for users collection
userSchema = mongoose.Schema({
    id:Number,
    name: String,
    email: String,
    phone: Number,
    password: String,
    wishlist: [],
    orders: []
    })
const User = mongoose.model('User', userSchema)

//table for auto icrement user id
counterSchema = mongoose.Schema({
    seqname:String,
    seqvalue:Number
})
const Counter = mongoose.model('Counter', counterSchema)

//model for products collection
const Product = mongoose.model('Product',
{
    id: Number,
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    rating: {
      rate: Number,
      count: Number
    }
  }
)
  //model for products collection
const Cart = mongoose.model('Cart',
{
    id: Number,
    productList :[],
    totalQuantity: Number,
    totalPrice: Number,
    tax:Number,
    discount: Number,
    shippingCost: Number,
    grantTotal: Number,
    shippingAddr:[],
    payment: String,
    orderId:String,
    date:String
  }
)


//export moddel
module.exports={
    User,
    Counter,
    Product,
    Cart
}