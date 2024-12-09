import React from "react";
import { useDispatch, useSelector } from "react-redux";

export default function CounterComponent() {
  const { count } = useSelector((store) => store.reducer);
  const dispatch = useDispatch();
  return <div>CounterComponent</div>;
}
