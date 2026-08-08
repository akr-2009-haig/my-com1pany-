
const {getIO}=require('../lib/socket');
function emitEvent(eventName,data){
  const io=getIO();
  if(io) io.emit(eventName,data);
}
module.exports=emitEvent;
