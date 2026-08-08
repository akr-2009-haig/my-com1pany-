
exports.uploadSingle=async(req,res,next)=>{ try{ if(!req.file) return res.status(400).json({message:"No file"}); res.json({url:req.file.path, filename:req.file.filename}); }catch(e){next(e)} };
exports.uploadMultiple=async(req,res,next)=>{ try{ const urls=(req.files||[]).map(f=>({url:f.path,filename:f.filename})); res.json(urls);}catch(e){next(e)} };
