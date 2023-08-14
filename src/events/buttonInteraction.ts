import Event from '../types/Event';


const buttonInteraction: Event = {
    name: 'buttonInteraction',
    execute: function (){
        console.log("Button interaction event fired.");
    }
}

export default buttonInteraction;