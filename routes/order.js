const Customer = require('../models/customer')
const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Item = require('../models/item');
const DeliveryBoy = require('../models/deliveryboy')


router.post('/changestatus/:id', async (req, res) => {
  const orderId = req.params.id;
  const { newStatus } = req.body; // Assuming the new status is passed in the body

  try {
      // Find the order by ID
      const order = await Order.findOne({ _id: orderId });
      
      if (!order) {
          return res.status(404).json({ message: "No such order found" });
      }

      
      const deliveryBoy = await DeliveryBoy.findById(order.deliveryBoy).populate('completedOrders');

      if (!deliveryBoy) {
          return res.status(404).json({ message: "No delivery boy assigned to this order" });
      }
    
      // Handle order status transitions
      if (order.status === 'pending') {
          if (newStatus === 'delivered' || newStatus === 'canceled') {
              // If the status is 'delivered', move to completed orders and remove from assigned orders
              if (newStatus === 'delivered') {
                  // Add order to completedOrders
                  deliveryBoy.completedOrders.push(order._id);
                  // Remove order from assignedOrders
                  deliveryBoy.assignedOrders = deliveryBoy.assignedOrders.filter(orderId => orderId.toString() !== orderId.toString());
              } 
              // If the status is 'canceled', remove the order from assigned orders
              if (newStatus === 'canceled') {
                  deliveryBoy.assignedOrders = deliveryBoy.assignedOrders.filter(orderId => orderId.toString() !== orderId.toString());
              }

              // Update order status
              order.status = newStatus;
              await deliveryBoy.save();
          } else {
              return res.status(400).json({ message: "Invalid status transition" });
          }
      } else if (order.status === 'delivered' || order.status === 'canceled') {
          return res.status(400).json({ message: "Cannot change the status of a completed or canceled order" });
      } else {
          return res.status(400).json({ message: "Unknown order status" });
      }

      // Save the updated order
      await order.save();

      // Return the updated order and delivery boy info
      res.json({
        message: `Order status updated to ${newStatus}`,
        order,
        deliveryBoy,
      });
  } catch (error) {
      console.error("Error changing order status:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/deliveryboy/showorders',async(req,res)=>{
  
  try{
    const orders = await Order.find({}).populate('items')
    if(!orders){
      return res.status(404).json({message:'Orders not found'})
    }
    return res.status(201).json({order:orders})
  }catch(err){
    return res.json(500).json({message:"Internal Server error"})
  }
})

router.get('/deliveryboy/showpendingorders',async(req,res)=>{
  
  try{
    const orders = await Order.find({status:'pending'}).populate('items')
    if(!orders){
      return res.status(404).json({message:'Orders not found'})
    }
    return res.status(201).json({order:orders})
  }catch(err){
    return res.json(500).json({message:"Internal Server error"})
  }
})

router.post('/', async (req, res) => {
  try {
    const { customerName, items } = req.body;
   
    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid order data.' });
    }

    let totalAmount = 0;
    const validatedItems = [];

    // Validate items and calculate the total amount
    for (const item of items) {
      const menuItem = await Item.findById(item.menuId);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item not found: ${item.menuId}` });
      }

      const quantity = item.quantity || 1;
      totalAmount += menuItem.price * quantity;
      validatedItems.push({
        menuId: menuItem._id,
        quantity,
      });
    }

    

    

    
    const availableDeliveryBoys = await DeliveryBoy.find({
      status: 'available',
    }).populate('assignedOrders');
  
    const availableDeliveryBoy = availableDeliveryBoys.find(boy => boy.assignedOrders.length < 10);
    if (!availableDeliveryBoy) {
      return res.status(404).json({ message: 'No available delivery boy with less than 10 orders.' });
    }
// Create the order
const newOrder = new Order({
  customerName,
  items: validatedItems,
  totalAmount,
  deliveryBoy: availableDeliveryBoy._id,
});

await newOrder.save();
    // Find the customer
    const customer = await Customer.findOne({ email: customerName });
    if (!customer) {
      return res.status(404).json({ message: `Customer not found: ${customerName}` });
    }

    
    customer.orders.push(newOrder._id);
    await customer.save();
    availableDeliveryBoy.assignedOrders.push(newOrder._id);
    availableDeliveryBoy.status = 'available'; // Update delivery boy's status to 'on_delivery'

    
    await availableDeliveryBoy.save();

    res.status(201).json({
      message: 'Order placed and assigned to a delivery boy successfully.',
      orderId: newOrder._id,
      totalAmount: newOrder.totalAmount,
      deliveryBoy: availableDeliveryBoy._id,
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


router.get('/:id',async(req,res)=>{
  const email = req.params.id
  const customer = await Customer.find({email:email})

  if(!customer){
    return res.status(404).json({message:'Customer not found'})
  }
  try{
    const orders = await Order.find({customerName:email}).populate({
      path:'items',
      modal:'Item',
      select:'name price'
    })
    res.status(201).json({order:orders})
    
  }catch(err){
    res.status(500).json({ message: 'Internal server error.' });
  }
})

module.exports = router;

