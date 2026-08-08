
const ContactMessage=require('../models/ContactMessage');
const QuoteRequest=require('../models/QuoteRequest');
const Post=require('../models/Post');
const Project=require('../models/Project');
exports.overview=async(req,res,next)=>{
  try{
    const messages=await ContactMessage.countDocuments();
    const quotes=await QuoteRequest.countDocuments();
    const posts=await Post.countDocuments();
    const projects=await Project.countDocuments();
    // mock visits
    const visits=[120,190,150,210,180,230,200,250,220,280,260,300];
    res.json({messages,quotes,posts,projects, visits});
  }catch(e){next(e)}
};
