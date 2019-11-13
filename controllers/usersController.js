const express = require ('express');
const router = express.Router();
const User = require('../models/user')

// Creating a user & returning info
router.post('/', async (res, req)=>{
    try{
        console.log(req.body, " is this it?")
        const createUser = await User.create(req.body)

        res.json({
            status: 200,
            data: createUser
        })

    }catch(err){
        console.log(err);
        res.send(err);
    }
});

//delete user & returning what was deleted
router.delete('/:id', async (req, res) =>{
    try{
        console.log("Delete User");
        const deletedUser = await User.findByIdAndRemove(req.params.id);
        console.log(deletedUser);
        res.json({
            status: 200,
            data: deletedUser
        })
    }catch(err){
        res.send(err)
    }
});
 
//  PUT route for editing user
router.put('/:id', async (req, res)=>{
    console.log(req.body.location);
     try{
        console.log(req.body);
        const updateUser = await User.findByIdAndUpdate(req.params.id, req.body);
        res.json({
                status: 200,
                data: updateUser
            })
     }catch(err){
        res.json({
            status: 500,
            data: err
        });
     };
});


// GETTING and showing user to edit (not edited yet)
router.get('/:id/edit', async (req, res)=>{
    try {
        const foundUser = await Users.findById(req.params.id);
        console.log(foundUser);
        res.json({
            status: 200,
            data: foundUser
        });
    } catch (err){
        res.send(err)
    }
});



module.exports = router;