import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { Box, Typography, Tooltip } from '@mui/material';
import { MdOutlineLocationOn } from 'react-icons/md';

const RegionDisplay = () => {
  const { region, currentCurrency } = useCurrency();

  return (
    <Tooltip title={`Region: ${region} | Currency: ${currentCurrency?.name}`} arrow>
      <Box className="flex items-center gap-1 text-[11px] lg:text-[12px] text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
        <MdOutlineLocationOn className="text-[14px] lg:text-[16px] text-red-500" />
        <span className="font-[500] hidden sm:inline">{region}</span>
        <span className="font-[500] sm:hidden">{currentCurrency?.code}</span>
      </Box>
    </Tooltip>
  );
};

export default RegionDisplay;
