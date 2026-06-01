import React, { useState } from "react";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";

export const QtyBox = (props) => {
const [qtyVal, setQtyVal] = useState(1);

const plusQty=()=>{
    const newVal = qtyVal + 1;
    setQtyVal(newVal);
    props.handleSelecteQty(newVal)
}

const minusQty=()=>{
    if (qtyVal === 1) {
        props.handleSelecteQty(1)
    } else {
        const newVal = qtyVal - 1;
        setQtyVal(newVal)
        props.handleSelecteQty(newVal)
    }
}

  return (
    <div className="qtyBox flex items-center relative w-full sm:w-auto">
      <div className="flex items-center w-full sm:w-auto border border-gray-300 rounded-lg overflow-hidden">
        <input
          type="number"
          className="w-full min-w-[50px] h-9 p-2 text-center text-sm focus:outline-none text-gray-800 bg-white"
          value={qtyVal}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 1;
            setQtyVal(Math.max(1, val));
            props.handleSelecteQty(Math.max(1, val));
          }}
        />
        <div className="flex flex-col border-l border-gray-300">
          <button 
            className="w-7 h-4 text-gray-600 bg-gray-50 hover:bg-gray-100 border-b border-gray-300 flex items-center justify-center transition-colors"
            onClick={plusQty}
          >
            <FaAngleUp className="text-[8px]" />
          </button>
          <button 
            className="w-7 h-4 text-gray-600 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
            onClick={minusQty}
          >
            <FaAngleDown className="text-[8px]"/>
          </button>
        </div>
      </div>
    </div>
  );
};