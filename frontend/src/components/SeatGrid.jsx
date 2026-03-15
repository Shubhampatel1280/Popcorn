import { useState } from "react";

function SeatGrid(){

const [selected,setSelected] = useState([]);

const seats = Array.from({length:32},(_,i)=>i+1)

function toggleSeat(seat){

if(selected.includes(seat)){

setSelected(selected.filter(s=>s!==seat))

}else{

setSelected([...selected,seat])

}

}

return(

<div className="seat-container">

<div className="screen">SCREEN</div>

<div className="seat-grid">

{seats.map(seat=>(

<div
key={seat}
className={`seat ${selected.includes(seat)?"selected":""}`}
onClick={()=>toggleSeat(seat)}
>
{seat}
</div>

))}

</div>

</div>

)

}

export default SeatGrid