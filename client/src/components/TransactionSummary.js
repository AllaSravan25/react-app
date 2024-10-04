import React from 'react';

const TransactionSummary = ({ data }) => {
  // Add null checks and default values
  const totalReceived = data?.totalReceived || 0;
  const totalSent = data?.totalSent || 0;
  const balance = totalReceived - totalSent;

  return (
    <div>
      <p>Total Received: ${totalReceived.toFixed(2)}</p>
      <p>Total Sent: ${totalSent.toFixed(2)}</p>
      <p>Balance: ${balance.toFixed(2)}</p>
    </div>
  );
};

export default TransactionSummary;