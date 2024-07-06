import { legacy_createStore } from "redux";
import { reducer }  from "./CounterReducer";



export const store=legacy_createStore(reducer)