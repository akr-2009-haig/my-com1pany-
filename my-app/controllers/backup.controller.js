const {exec}=require('child_process');
const fs=require('fs');
const path=require('path');

// In production, use mongodump or AWS S3. Here we simulate with JSON export.
exports.createBackup=async(req,res,next)=>{
  try{
    const mongoose=require('mongoose');
    const collections=mongoose.connection.collections;
    const data={};
    for(const [name,col] of Object.entries(collections)){
      try{ data[name]=await col.find({}).limit(1000).toArray(); }catch(e){ data[name]=[]; }
    }
    const dir=path.join(process.cwd(),'backups');
    if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
    const file='backup_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';
    const full=path.join(dir,file);
    fs.writeFileSync(full, JSON.stringify(data,null,2));
    // keep only last 10
    const files=fs.readdirSync(dir).sort().reverse();
    files.slice(10).forEach(f=> { try{ fs.unlinkSync(path.join(dir,f)); }catch(e){} });
    res.json({message:'Backup created', file, size: fs.statSync(full).size});
  }catch(e){ next(e) }
};
exports.listBackups=async(req,res,next)=>{
  try{
    const dir=path.join(process.cwd(),'backups');
    if(!fs.existsSync(dir)) return res.json([]);
    const files=fs.readdirSync(dir).map(f=> {
      const s=fs.statSync(path.join(dir,f));
      return {name:f, size:s.size, date:s.mtime};
    }).sort((a,b)=> b.date - a.date);
    res.json(files);
  }catch(e){ next(e) }
};
exports.restoreBackup=async(req,res,next)=>{
  try{
    // For safety, only allow admin and log activity
    const ActivityLog=require('../models/ActivityLog');
    await ActivityLog.create({user:req.user.id, userName:req.user.email, action:'RESTORE_BACKUP', module:'backup', details: JSON.stringify(req.body), ip:req.ip}).catch(()=>{});
    res.json({message:'Restore simulated - in production would restore from file '+ (req.body.file||'')});
  }catch(e){ next(e) }
};
exports.deleteBackup=async(req,res,next)=>{
  try{
    const p=require('path');
    const dir=p.join(process.cwd(),'backups');
    const file=p.join(dir, req.params.file);
    if(!file.startsWith(dir)) return res.status(400).json({message:'Invalid path'});
    if(fs.existsSync(file)) fs.unlinkSync(file);
    res.json({message:'Deleted'});
  }catch(e){ next(e) }
};
