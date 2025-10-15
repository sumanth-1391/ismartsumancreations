(async ()=>{
  try{
    const res = await fetch('http://localhost:5001/api/videos');
    const j = await res.json();
    console.log('OK', Array.isArray(j)?`videos=${j.length}`:typeof j);
  }catch(e){
    console.error('ERR', e);
  }
})();
