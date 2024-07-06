import { DECREASECOUNT, UPDATECOUNT } from "./ActionType"

const initialSate={
    count:0
}

export const reducer=(state=initialSate,{type,payload})=>{
    switch(type){
        case UPDATECOUNT:{
            return {...state,count:state.count+1}
        }
        case DECREASECOUNT:{
            return {...state,count:state.count-1}
        }
        default:{
            return state
        }
    }
}