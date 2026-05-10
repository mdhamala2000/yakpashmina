import React, { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { Button, Menu, MenuItem, Typography, Box } from '@mui/material';
import { HiOutlineCurrencyDollar } from 'react-icons/hi';
import { FaChevronDown } from 'react-icons/fa';

const CurrencySelector = () => {
  const { currency, setCurrency, currencies, currentCurrency, exchangeRates } = useCurrency();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCurrencyChange = (currencyCode) => {
    setCurrency(currencyCode);
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        className="!text-[#000] !normal-case !flex !items-center !gap-1 !text-[12px] lg:!text-[13px] !font-[500] !px-2"
        startIcon={<HiOutlineCurrencyDollar className="text-[16px] lg:text-[18px]" />}
        endIcon={<FaChevronDown className="text-[10px]" />}
      >
        <span className="hidden sm:inline">{currentCurrency?.code}</span>
        <span className="sm:hidden">{currentCurrency?.symbol}</span>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 200,
            maxHeight: 300,
            mt: 1,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {Object.values(currencies).map((curr) => (
          <MenuItem
            key={curr.code}
            onClick={() => handleCurrencyChange(curr.code)}
            selected={currency === curr.code}
            className={`!py-2 !px-3 !min-h-[44px] ${currency === curr.code ? '!bg-blue-50' : ''}`}
          >
            <Box className="flex items-center justify-between w-full gap-3">
              <Box className="flex items-center gap-2">
                <span className="text-[16px]">{curr.flag}</span>
                <Typography className="!text-[13px] !font-[600] !text-gray-800">
                  {curr.code}
                </Typography>
              </Box>
              <Typography className="!text-[13px] !font-[500] !text-gray-600">
                {curr.symbol}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default CurrencySelector;
