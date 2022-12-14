const autoBind = require("auto-bind");
const { teammodel } = require("../../models/team");
const { usermodel } = require("../../models/user");

class TeamController{
    constructor(){
        autoBind(this)
    }
 async createTeam(req,res,next){
    try {
    const {user_name,description,name}=req.body;
    const owner=req.user._id;
    const team = await teammodel.create({
        user_name,
        name,
        description,
        owner
    })
    if(!team) throw {status:500,message:" create team failed"}
    return res.status(201).json({
        status:201,
        success:true,
        message:"Create Team Success"
    })     
    } catch (error) {
      next(error)  
    }

}
 async getlistofteam(req,res,next){
    try {
    const team=await teammodel.find({});
    return res.status(201).json({
        status:201,
        success:true,
        team
    })    
    } catch (error) {
        next(error)
    }

}
async getTeamByID(req,res,next){
    try {
     const teamID=req.params.id;
     const team=await teammodel.findById(teamID)
     if(!team) throw {status:500,message:"team not found..."}
     return res.status(201).json({
        status:200,
        success:true,
        team
     })   
    } catch (error) {
       next(error) 
    }
}

async getMyTeams(req,res,next){
    try {
     const userID=req.user._id;
     const team=await teammodel.aggregate([
     {
      $match:{  
        $or:[{owner:userID},{user:userID}] }
     },
     {
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"owner"
        }
     },
     {
        $project:{
            "owner.user_name":1,
            "owner.email":1,
            "owner.mobile":1
        }
     },
     {
        $unwind:"$owner"
     }
    


       
    ])
     return res.status(201).json({
        status:200,
        success:true,
        team
     })   
    } catch (error) {
        next(error)
    }
}

async removeTeamByID(req,res,next){
    try {
    const teamID=req.params.id;
    const team= await teammodel.findById(teamID);
    if(!team) throw {status:500,message:" the team  was not found"}
    const resultDelete=await teammodel.deleteOne({_id:teamID});
    if(resultDelete.deletedCount == 0) throw {status:500,message:"The team was not deleted"}  
    return res.status(201).json({
        status:201,
        success:true,
        message:"the team was deleted!"
    })  
    } catch (error) {
        next(error)
    }
}
async findUserTeam(teamID,userID) {
const result=await teammodel.findOne({
    $or:[{owner:userID},{users:userID}],_id:teamID
})
return !! result
    
}
async inviteUsertoTeam(req,res,next){
try {
const userID=req.user._id;
const {user_name,teamID}=req.params;
const team=await this.findUserTeam(teamID,userID);
if(!team) throw {status:400,message:"No team was found to invite"}
const user=await usermodel.findOne({user_name})
if(!user) throw {status:400,message:"The  user to invite to the team was not found"} 
const inviteUser=await this.findUserTeam(teamID,user._id)
if(inviteUser) throw {status:400,message:"The user has already been invited to the team"} 
const request=
{caller:req.user.user_name,
    requestDate:new Date(),
    teamID,
    Status:"pending"
}
const updateUserResult=await usermodel.updateOne({user_name},{
    $push:{inviteRequests:request}
})
if(updateUserResult.modifiedCount == 0) throw{status:500,message:"The invitation request was not registered"} 
return res.status(200).json({
    status:200,
    success:true,
    message:"Invitation registration successfully created"
})
} catch (error) {
   next(error) 
}
}
async UpdateTeam(req,res,next){
    try {
        const data={...req.body};
        Object.entries(data).forEach((key)=>{
            if(!data[key]) delete data[key]   
 if([""," ",null,NaN,undefined].includes(key)) delete data[key];
})
const userID=req.user._id;
 const {teamID}=req.params;
 const team=await teammodel.find({owner:userID},{_id:teamID})
 if(!team) throw {status:404,message:"No team was found with this specification"}
 const updateTeam=await teammodel.updateOne({_id:teamID},{$set:data})
 if(updateTeam.modifiedCount == 0) throw {status:500,message:"Update failed"} 
 return res.status(200).json({
     status:200,
     success:true,
     message:"Update Done"
    })    
} catch (error) {
    next(error) 
}

}
RemoveTeam(){

}
RemoveUserFromTeam(){

}    
}
module.exports={
    TeamController:new TeamController()
}