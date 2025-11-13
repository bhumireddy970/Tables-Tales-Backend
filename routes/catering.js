const express = require('express');
const Customer = require('../models/customer');
const CateringEvent = require('../models/catering');

const router = express.Router()

router.post('/:id',async(req,res)=>{
    const email = req.params.id
    const { eventName, eventDate, numberOfGuests, dietaryPreferences, contactPerson,noOfDays, contactPhone, specialRequests, eventType } = req.body;
    try{
        const customer = await Customer.find({email:email})
        if(!customer){
            return res.status(404).json({message:'Customer not found'})
        }
        const newRequest = new CateringEvent({
            eventName,
            eventDate,
            numberOfGuests,
            dietaryPreferences,
            contactPerson,
            noOfDays,
            contactPhone,
            specialRequests,
            eventType,
            completed:false,
            status:'Not yet done'
          });
      
          await newRequest.save();
          res.status(201).json({ message: 'Request submitted successfully!', data: newRequest });
    }catch(err){
        return res.status(500).json({message:'Catering Request is not accepted'})
    }
})

router.get('/getEvents',async(req,res)=>{
    try{
        const events = await CateringEvent.find()
        if(!events){
            return res.status(404).json({message:"Evemts not found"})
        }
        return res.status(201).json({events:events})
    }catch(err){
        return res.status(500).json({message:"Internal server error"})
    }
})

module.exports = router