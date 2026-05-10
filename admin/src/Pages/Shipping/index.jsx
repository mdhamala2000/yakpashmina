import React, { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Switch, FormControlLabel, Checkbox,
  IconButton, Chip, InputAdornment, Tooltip
} from '@mui/material';
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaGlobe,
  FaDollarSign, FaGift, FaTimes, FaCheck, FaShippingFast,
  FaGlobeAmericas, FaToggleOn, FaToggleOff
} from 'react-icons/fa';
import { deleteData, postData, editData, fetchDataFromApi } from '../../utils/api';
import { MyContext } from '../../App.jsx';

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' }, { code: 'AL', name: 'Albania' }, { code: 'DZ', name: 'Algeria' },
  { code: 'AR', name: 'Argentina' }, { code: 'AM', name: 'Armenia' }, { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' }, { code: 'AZ', name: 'Azerbaijan' }, { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' }, { code: 'BY', name: 'Belarus' }, { code: 'BE', name: 'Belgium' },
  { code: 'BT', name: 'Bhutan' }, { code: 'BO', name: 'Bolivia' }, { code: 'BA', name: 'Bosnia' },
  { code: 'BR', name: 'Brazil' }, { code: 'BN', name: 'Brunei' }, { code: 'BG', name: 'Bulgaria' },
  { code: 'KH', name: 'Cambodia' }, { code: 'CM', name: 'Cameroon' }, { code: 'CA', name: 'Canada' },
  { code: 'CL', name: 'Chile' }, { code: 'CN', name: 'China' }, { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' }, { code: 'HR', name: 'Croatia' }, { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' }, { code: 'DK', name: 'Denmark' }, { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' }, { code: 'EG', name: 'Egypt' }, { code: 'SV', name: 'El Salvador' },
  { code: 'EE', name: 'Estonia' }, { code: 'ET', name: 'Ethiopia' }, { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' }, { code: 'FR', name: 'France' }, { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' }, { code: 'GH', name: 'Ghana' }, { code: 'GR', name: 'Greece' },
  { code: 'GT', name: 'Guatemala' }, { code: 'HN', name: 'Honduras' }, { code: 'HK', name: 'Hong Kong' },
  { code: 'HU', name: 'Hungary' }, { code: 'IS', name: 'Iceland' }, { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' }, { code: 'IR', name: 'Iran' }, { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' }, { code: 'IL', name: 'Israel' }, { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' }, { code: 'JP', name: 'Japan' }, { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' }, { code: 'KE', name: 'Kenya' }, { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' }, { code: 'LA', name: 'Laos' }, { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' }, { code: 'LT', name: 'Lithuania' }, { code: 'LU', name: 'Luxembourg' },
  { code: 'MO', name: 'Macau' }, { code: 'MK', name: 'Macedonia' }, { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' }, { code: 'MT', name: 'Malta' }, { code: 'MX', name: 'Mexico' },
  { code: 'MD', name: 'Moldova' }, { code: 'MN', name: 'Mongolia' }, { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' }, { code: 'MM', name: 'Myanmar' }, { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' }, { code: 'NZ', name: 'New Zealand' }, { code: 'NI', name: 'Nicaragua' },
  { code: 'NG', name: 'Nigeria' }, { code: 'KP', name: 'North Korea' }, { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' }, { code: 'PK', name: 'Pakistan' }, { code: 'PA', name: 'Panama' },
  { code: 'PY', name: 'Paraguay' }, { code: 'PE', name: 'Peru' }, { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' }, { code: 'PT', name: 'Portugal' }, { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' }, { code: 'RU', name: 'Russia' }, { code: 'SA', name: 'Saudi Arabia' },
  { code: 'RS', name: 'Serbia' }, { code: 'SG', name: 'Singapore' }, { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' }, { code: 'SO', name: 'Somalia' }, { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' }, { code: 'ES', name: 'Spain' }, { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' }, { code: 'SE', name: 'Sweden' }, { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' }, { code: 'TW', name: 'Taiwan' }, { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' }, { code: 'TH', name: 'Thailand' }, { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' }, { code: 'TM', name: 'Turkmenistan' }, { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' }, { code: 'UY', name: 'Uruguay' }, { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VE', name: 'Venezuela' }, { code: 'VN', name: 'Vietnam' }, { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' }, { code: 'ZW', name: 'Zimbabwe' }
];

const ALL_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium',
  'Bhutan', 'Bolivia', 'Bosnia', 'Brazil', 'Brunei', 'Bulgaria',
  'Cambodia', 'Cameroon', 'Canada', 'Chile', 'China', 'Colombia',
  'Costa Rica', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark',
  'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Estonia',
  'Ethiopia', 'Fiji', 'Finland', 'France', 'Georgia', 'Germany',
  'Ghana', 'Greece', 'Guatemala', 'Honduras', 'Hong Kong', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
  'Lithuania', 'Luxembourg', 'Macau', 'Macedonia', 'Malaysia', 'Maldives',
  'Malta', 'Mexico', 'Moldova', 'Mongolia', 'Montenegro', 'Morocco',
  'Myanmar', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Nigeria',
  'North Korea', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Paraguay',
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Saudi Arabia', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia',
  'Somalia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan',
  'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania',
  'Thailand', 'Tunisia', 'Turkey', 'Turkmenistan', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const Shipping = () => {
  const [shippingData, setShippingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [formData, setFormData] = useState({
    country: '',
    countryCode: '',
    pricingType: 'flat',
    flatRate: '',
    freeShippingThreshold: '',
    estimatedDeliveryDays: '',
    currency: 'USD',
    isActive: true,
    selectAllCountries: false
  });

  const context = React.useContext(MyContext);

  useEffect(() => {
    fetchShippingData();
  }, []);

  const fetchShippingData = () => {
    setLoading(true);
    fetchDataFromApi('/api/shippingRate').then((res) => {
      if (res?.success) {
        setShippingData(res?.data || []);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleOpenDialog = (ship = null) => {
    if (ship) {
      setFormData({
        country: ship.country || '',
        countryCode: ship.countryCode || '',
        pricingType: ship.pricingType || 'flat',
        flatRate: ship.flatRate || '',
        freeShippingThreshold: ship.freeShippingThreshold || '',
        estimatedDeliveryDays: ship.estimatedDeliveryDays || '',
        currency: ship.currency || 'USD',
        isActive: ship.isActive !== false,
        selectAllCountries: false
      });
      setSelectedShipping(ship);
    } else {
      setFormData({
        country: '',
        countryCode: '',
        pricingType: 'flat',
        flatRate: '',
        freeShippingThreshold: '',
        estimatedDeliveryDays: '',
        currency: 'USD',
        isActive: true,
        selectAllCountries: false
      });
      setSelectedShipping(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedShipping(null);
    setFormData({
      country: '',
      countryCode: '',
      pricingType: 'flat',
      flatRate: '',
      freeShippingThreshold: '',
      estimatedDeliveryDays: '',
      currency: 'USD',
      isActive: true,
      selectAllCountries: false
    });
  };

  const handleCountryChange = (countryName) => {
    const country = COUNTRIES.find(c => c.name === countryName);
    setFormData({
      ...formData,
      country: countryName,
      countryCode: country?.code || ''
    });
  };

  const handleSelectAllCountries = () => {
    setFormData({
      ...formData,
      selectAllCountries: !formData.selectAllCountries
    });
  };

  const handleSubmit = async () => {
    try {
      if (formData.selectAllCountries) {
        const unselectedCountries = ALL_COUNTRIES.filter(
          name => !shippingData.some(s => s.country?.toLowerCase() === name.toLowerCase())
        );

        for (const countryName of unselectedCountries) {
          const country = COUNTRIES.find(c => c.name === countryName);
          await postData('/api/shippingRate/create', {
            country: countryName,
            countryCode: country?.code || '',
            pricingType: formData.pricingType,
            flatRate: formData.pricingType === 'flat' ? parseFloat(formData.flatRate) || 0 : 0,
            freeShippingThreshold: formData.pricingType === 'free' ? parseFloat(formData.freeShippingThreshold) || null : null,
            estimatedDeliveryDays: formData.estimatedDeliveryDays,
            currency: formData.currency,
            isActive: formData.isActive
          });
        }
        context.alertBox('success', `${unselectedCountries.length} shipping rates created for all countries`);
      } else {
        if (!formData.country) {
          context.alertBox('error', 'Please select a country');
          return;
        }

        const payload = {
          country: formData.country,
          countryCode: formData.countryCode,
          pricingType: formData.pricingType,
          flatRate: formData.pricingType === 'flat' ? parseFloat(formData.flatRate) || 0 : 0,
          freeShippingThreshold: formData.pricingType === 'free' ? parseFloat(formData.freeShippingThreshold) || null : null,
          estimatedDeliveryDays: formData.estimatedDeliveryDays,
          currency: formData.currency,
          isActive: formData.isActive
        };

        if (selectedShipping) {
          await editData(`/api/shippingRate/${selectedShipping._id}`, payload);
          context.alertBox('success', 'Shipping rate updated successfully');
        } else {
          await postData('/api/shipping/create', payload);
          context.alertBox('success', 'Shipping rate created successfully');
        }
      }
      handleCloseDialog();
      fetchShippingData();
    } catch (error) {
      context.alertBox('error', error?.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteData(`/api/shippingRate/${selectedForDelete._id}`);
      context.alertBox('success', 'Shipping rate deleted successfully');
      setOpenDeleteDialog(false);
      setSelectedForDelete(null);
      fetchShippingData();
    } catch (error) {
      context.alertBox('error', 'Delete failed');
    }
  };

  const handleToggleStatus = async (ship) => {
    try {
      await editData(`/api/shippingRate/${ship._id}/toggle`, { isActive: !ship.isActive });
      fetchShippingData();
      context.alertBox('success', `Shipping rate ${ship.isActive ? 'deactivated' : 'activated'}`);
    } catch (error) {
      context.alertBox('error', 'Status update failed');
    }
  };

  const filteredData = shippingData?.filter(ship =>
    ship.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ship.countryCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPricingLabel = (ship) => {
    if (ship.pricingType === 'free') {
      return ship.freeShippingThreshold
        ? `Free over ${ship.currency} ${ship.freeShippingThreshold}`
        : 'Free Shipping';
    }
    return `${ship.currency} ${ship.flatRate}`;
  };

  const getPricingTypeBadge = (type) => {
    return type === 'free'
      ? <Chip icon={<FaGift />} label="Free" color="success" size="small" variant="soft" />
      : <Chip icon={<FaDollarSign />} label="Flat Rate" color="primary" size="small" variant="soft" />;
  };

  return (
    <div className="card my-2 md:mt-4 shadow-md sm:rounded-lg bg-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <FaShippingFast className="text-blue-600 text-sm" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Shipping Rates</h2>
            <p className="text-xs text-gray-500">{shippingData.length} countries</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Button
            variant="contained"
            startIcon={<FaPlus />}
            onClick={() => handleOpenDialog()}
            className="!bg-blue-600 hover:!bg-blue-700 !px-4 !py-2"
          >
            Add Shipping
          </Button>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredData?.length === 0 ? (
          <div className="text-center py-20">
            <FaGlobeAmericas className="text-gray-300 text-6xl mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No shipping rates configured</p>
            <Button
              variant="contained"
              startIcon={<FaPlus />}
              onClick={() => handleOpenDialog()}
              className="!mt-4 !bg-blue-600"
            >
              Add Your First Shipping Rate
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredData?.map((ship) => (
              <div
                key={ship._id}
                className={`border rounded-xl p-4 transition-all hover:shadow-lg ${
                  ship.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {ship.countryCode === 'US' ? '🇺🇸' :
                       ship.countryCode === 'GB' ? '🇬🇧' :
                       ship.countryCode === 'IN' ? '🇮🇳' :
                       ship.countryCode === 'AU' ? '🇦🇺' :
                       ship.countryCode === 'CA' ? '🇨🇦' :
                       ship.countryCode === 'DE' ? '🇩🇪' :
                       ship.countryCode === 'FR' ? '🇫🇷' :
                       ship.countryCode === 'JP' ? '🇯🇵' :
                       ship.countryCode === 'CN' ? '🇨🇳' :
                       ship.countryCode === 'NP' ? '🇳🇵' : '🌍'}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-800">{ship.country}</h3>
                      <span className="text-xs text-gray-500">{ship.countryCode}</span>
                    </div>
                  </div>
                  <Tooltip title={ship.isActive ? 'Active' : 'Inactive'}>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(ship)}
                      className={ship.isActive ? 'text-green-600' : 'text-gray-400'}
                    >
                      {ship.isActive ? <FaToggleOn className="text-xl" /> : <FaToggleOff className="text-xl" />}
                    </IconButton>
                  </Tooltip>
                </div>

                <div className="mb-3">
                  {getPricingTypeBadge(ship.pricingType)}
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="text-2xl font-bold text-gray-800">
                    {getPricingLabel(ship)}
                  </div>
                  {ship.estimatedDeliveryDays && (
                    <div className="text-sm text-gray-500 mt-1">
                      Delivery: {ship.estimatedDeliveryDays}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FaEdit />}
                    onClick={() => handleOpenDialog(ship)}
                    className="flex-1 !text-blue-600 !border-blue-600 hover:!bg-blue-50"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FaTrash />}
                    onClick={() => {
                      setSelectedForDelete(ship);
                      setOpenDeleteDialog(true);
                    }}
                    className="!text-red-600 !border-red-600 hover:!bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        className="!rounded-xl"
      >
        <DialogTitle className="flex items-center justify-between border-b pb-4">
          <span className="text-xl font-semibold">
            {selectedShipping ? 'Edit Shipping Rate' : 'Add Shipping Rate'}
          </span>
          <IconButton onClick={handleCloseDialog}>
            <FaTimes />
          </IconButton>
        </DialogTitle>
        <DialogContent className="pt-6">
          <div className="space-y-5">
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.selectAllCountries}
                  onChange={handleSelectAllCountries}
                  color="primary"
                />
              }
              label={
                <span className="flex items-center gap-2">
                  <FaGlobe className="text-blue-500" />
                  Apply to all countries at once
                </span>
              }
              className="!mb-4 !block"
            />

            {formData.selectAllCountries ? (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-blue-800 font-medium mb-2">
                  This will add shipping rates for {ALL_COUNTRIES.length - shippingData.length} remaining countries
                </p>
                <p className="text-sm text-blue-600">
                  Select the pricing type and rates below that will apply to all countries
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Country *</label>
                <select
                  value={formData.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a country</option>
                  {COUNTRIES.map((country) => (
                    <option
                      key={country.code}
                      value={country.name}
                      disabled={shippingData.some(
                        s => s.country?.toLowerCase() === country.name.toLowerCase() &&
                        s._id !== selectedShipping?._id
                      )}
                    >
                      {country.name} ({country.code})
                      {shippingData.some(s => s.country?.toLowerCase() === country.name.toLowerCase()) ? ' - Already added' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Type *</label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setFormData({ ...formData, pricingType: 'flat' })}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.pricingType === 'flat'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      formData.pricingType === 'flat' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}>
                      <FaDollarSign />
                    </div>
                    <div>
                      <div className="font-semibold">Flat Rate</div>
                      <div className="text-xs text-gray-500">Fixed shipping cost</div>
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => setFormData({ ...formData, pricingType: 'free' })}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.pricingType === 'free'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      formData.pricingType === 'free' ? 'bg-green-500 text-white' : 'bg-gray-200'
                    }`}>
                      <FaGift />
                    </div>
                    <div>
                      <div className="font-semibold">Free Shipping</div>
                      <div className="text-xs text-gray-500">Based on order value</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {formData.pricingType === 'flat' ? (
              <TextField
                fullWidth
                label="Flat Rate Amount"
                type="number"
                value={formData.flatRate}
                onChange={(e) => setFormData({ ...formData, flatRate: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{formData.currency}</InputAdornment>
                }}
              />
            ) : (
              <TextField
                fullWidth
                label="Free Shipping Minimum Order Value"
                type="number"
                value={formData.freeShippingThreshold}
                onChange={(e) => setFormData({ ...formData, freeShippingThreshold: e.target.value })}
                placeholder="Leave empty for always free"
                helperText="Orders above this amount will have free shipping"
                InputProps={{
                  startAdornment: <InputAdornment position="start">{formData.currency}</InputAdornment>
                }}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Estimated Delivery"
                value={formData.estimatedDeliveryDays}
                onChange={(e) => setFormData({ ...formData, estimatedDeliveryDays: e.target.value })}
                placeholder="e.g., 3-5 days"
              />
              <TextField
                fullWidth
                select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        width: 200,
                      },
                    },
                  },
                }}
                className="!w-full"
              >
                <MenuItem value="USD" className="!whitespace-nowrap">USD - US Dollar</MenuItem>
                <MenuItem value="EUR" className="!whitespace-nowrap">EUR - Euro</MenuItem>
                <MenuItem value="GBP" className="!whitespace-nowrap">GBP - British Pound</MenuItem>
                <MenuItem value="INR" className="!whitespace-nowrap">INR - Indian Rupee</MenuItem>
                <MenuItem value="AUD" className="!whitespace-nowrap">AUD - Australian Dollar</MenuItem>
                <MenuItem value="CAD" className="!whitespace-nowrap">CAD - Canadian Dollar</MenuItem>
                <MenuItem value="JPY" className="!whitespace-nowrap">JPY - Japanese Yen</MenuItem>
                <MenuItem value="CNY" className="!whitespace-nowrap">CNY - Chinese Yuan</MenuItem>
                <MenuItem value="NPR" className="!whitespace-nowrap">NPR - Nepalese Rupee</MenuItem>
              </TextField>
            </div>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="primary"
                />
              }
              label="Active"
            />
          </div>
        </DialogContent>
        <DialogActions className="p-4 border-t">
          <Button onClick={handleCloseDialog} variant="outlined" className="!border-gray-300">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            className="!bg-blue-600 hover:!bg-blue-700"
          >
            {selectedShipping ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="text-center pt-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <FaTrash className="text-red-600 text-2xl" />
          </div>
          <h3 className="text-xl font-semibold">Delete Shipping Rate?</h3>
        </DialogTitle>
        <DialogContent className="text-center pb-2">
          <p className="text-gray-600">
            Are you sure you want to delete shipping rate for <strong>{selectedForDelete?.country}</strong>?
            This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions className="p-4 pt-0">
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            className="!flex-1 !border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            className="!flex-1 !bg-red-600 hover:!bg-red-700"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Shipping;