const User = require('../models/User');
const stripe = require('stripe')('sk_test_W64Ct0wmxgf5B6K7faHVOF6A');
module.exports = async function(req, res, next){
    let event = req.body;
    console.log(event, "-- new STRIPE EVENT");
    let subscription, customer;
    // Handle the event
    
    switch (event.type) {
      case 'customer.subscription.deleted':
        
        subscription = event.data.object;
        User.findOne({subscriptionID: subscription.id}, (err, user) => {
            if(err){
                return res.json({received: true});
            }
            user.subscriptionStatus = subscription.status;
            user.save((err) => {
                if(err){
                    console.error("error saving user", err);

                }else{
                    res.json({received: true});
                }
            })

        })
        console.log("DELETED")
        break;
      case 'customer.subscription.updated':
        subscription = event.data.object;
        if(event.data.previous_attributes.metadata.sb_tier){
            console.log("switched from " + event.data.previous_attributes.metadata.sb_tier + " to " + subscription.metadata.sb_tier);
            User.findOne({subscriptionID: subscription.id}, (err, user) => {
                if(err || !user){
                    return res.json({received: true});
                }
                user.tier = subscription.metadata.sb_tier; 
                user.save((err) => {
                    if(err){
                        console.error("error saving user", err);

                    }else{
                        res.json({received: true});
                    }
                })

            })
        }
        console.log("UPDATED")
        break;
      // ... handle other event types
      default:
        // Unexpected event type
        return res.status(400).end();
    }
  
    // Return a response to acknowledge receipt of the event
  
}