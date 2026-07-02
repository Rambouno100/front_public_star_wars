import React from 'react';

const PaymentForm = ({ popin = false }) => {
  return (
    <div className="kr-embedded" kr-popin={popin ? "kr-popin" : ""}></div>
  );
};

export default PaymentForm;