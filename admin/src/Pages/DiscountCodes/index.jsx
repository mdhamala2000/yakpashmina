import React, { useContext, useEffect, useState } from 'react';
import { Button } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Link } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { GoTrash } from "react-icons/go";
import { MyContext } from '../../App';
import { fetchDataFromApi, deleteData, postData, putData } from '../../utils/api';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import { FaTimes } from 'react-icons/fa';
import Chip from '@mui/material/Chip';

const columns = [
    { id: "code", label: "CODE", minWidth: 120 },
    { id: "discountType", label: "TYPE", minWidth: 100 },
    { id: "discountValue", label: "VALUE", minWidth: 100 },
    { id: "minPurchase", label: "MIN PURCHASE", minWidth: 120 },
    { id: "usage", label: "USAGE", minWidth: 100 },
    { id: "status", label: "STATUS", minWidth: 100 },
    { id: "action", label: "Action", minWidth: 100 },
];

const DiscountCodes = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [discountCodes, setDiscountCodes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCode, setSelectedCode] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchaseAmount: '',
        maxDiscountAmount: '',
        description: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        isActive: true
    });

    const context = useContext(MyContext);

    useEffect(() => {
        fetchDiscountCodes();
    }, []);

    const fetchDiscountCodes = () => {
        fetchDataFromApi("/api/discountCode").then((res) => {
            if (res?.success) {
                setDiscountCodes(res?.data || []);
            }
        });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSwitchChange = (e) => {
        setFormData({
            ...formData,
            isActive: e.target.checked
        });
    };

    const handleOpenDialog = (code = null) => {
        if (code) {
            setEditMode(true);
            setSelectedCode(code);
            setFormData({
                code: code.code,
                discountType: code.discountType,
                discountValue: code.discountValue,
                minPurchaseAmount: code.minPurchaseAmount || '',
                maxDiscountAmount: code.maxDiscountAmount || '',
                description: code.description || '',
                startDate: code.startDate ? code.startDate.split('T')[0] : '',
                endDate: code.endDate ? code.endDate.split('T')[0] : '',
                usageLimit: code.usageLimit || '',
                isActive: code.isActive
            });
        } else {
            setEditMode(false);
            setSelectedCode(null);
            setFormData({
                code: '',
                discountType: 'percentage',
                discountValue: '',
                minPurchaseAmount: '',
                maxDiscountAmount: '',
                description: '',
                startDate: '',
                endDate: '',
                usageLimit: '',
                isActive: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCode(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            code: formData.code,
            discountType: formData.discountType,
            discountValue: parseFloat(formData.discountValue),
            minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : 0,
            maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
            description: formData.description,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
            isActive: formData.isActive
        };

        if (editMode && selectedCode) {
            putData(`/api/discountCode/${selectedCode._id}`, payload).then((res) => {
                if (res?.success === false) {
                    context.alertBox("error", res?.message);
                } else {
                    context.alertBox("success", "Discount code updated successfully");
                    fetchDiscountCodes();
                    handleCloseDialog();
                }
            });
        } else {
            postData("/api/discountCode/create", payload).then((res) => {
                if (res?.success === false) {
                    context.alertBox("error", res?.message);
                } else {
                    context.alertBox("success", "Discount code created successfully");
                    fetchDiscountCodes();
                    handleCloseDialog();
                }
            });
        }
    };

    const deleteDiscountCode = (id) => {
        if (window.confirm("Are you sure you want to delete this discount code?")) {
            deleteData(`/api/discountCode/${id}`).then((res) => {
                context.alertBox("success", "Discount code deleted successfully");
                fetchDiscountCodes();
            });
        }
    };

    return (
        <>
            <div className="flex items-center justify-between px-2 py-0 mt-1">
                <h2 className="text-[18px] font-[600]">
                    Discount Codes
                </h2>

                <div className="col w-[40%] ml-auto flex items-center justify-end gap-3">
                    <Button 
                        className="btn-blue btn !text-white btn-sm" 
                        onClick={() => handleOpenDialog()}
                    >
                        Add Discount Code
                    </Button>
                </div>
            </div>

            <div className="card my-4 pt-5 shadow-md sm:rounded-lg bg-white">
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        width={column.minWidth}
                                        style={{ top: 0 }}
                                        className="!font-bold !bg-gray-100"
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {discountCodes
                                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                            <TableCell className="!font-bold !text-primary">
                                                {row.code}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.discountType === 'percentage' ? '%' : 'Fixed'} 
                                                    size="small"
                                                    className={row.discountType === 'percentage' ? '!bg-blue-100 !text-blue-800' : '!bg-green-100 !text-green-800'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {row.discountType === 'percentage' 
                                                    ? `${row.discountValue}%` 
                                                    : `$${row.discountValue}`
                                                }
                                            </TableCell>
                                            <TableCell>
                                                ${row.minPurchaseAmount || 0}
                                            </TableCell>
                                            <TableCell>
                                                {row.usageCount || 0}/{row.usageLimit || '∞'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.isActive ? 'Active' : 'Inactive'} 
                                                    size="small"
                                                    className={row.isActive ? '!bg-green-100 !text-green-800' : '!bg-red-100 !text-red-800'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        className="!min-w-0 !p-1"
                                                        onClick={() => handleOpenDialog(row)}
                                                    >
                                                        <AiOutlineEdit className="text-[20px] text-blue-600" />
                                                    </Button>
                                                    <Button
                                                        className="!min-w-0 !p-1"
                                                        onClick={() => deleteDiscountCode(row._id)}
                                                    >
                                                        <GoTrash className="text-[20px] text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={discountCodes?.length || 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </div>

            {/* Dialog for Add/Edit Discount Code */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                className="discount-dialog"
            >
                <DialogTitle className="!font-bold !text-lg">
                    {editMode ? 'Edit Discount Code' : 'Add Discount Code'}
                    <IconButton
                        onClick={handleCloseDialog}
                        className="!absolute !right-4 !top-4"
                    >
                        <FaTimes />
                    </IconButton>
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <div className="flex flex-col gap-4 mt-2">
                            <TextField
                                label="Discount Code"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                required
                                fullWidth
                                placeholder="e.g., SAVE20"
                                InputProps={{
                                    style: { textTransform: 'uppercase' }
                                }}
                            />

                            <FormControl fullWidth required>
                                <InputLabel>Discount Type</InputLabel>
                                <Select
                                    name="discountType"
                                    value={formData.discountType}
                                    label="Discount Type"
                                    onChange={handleInputChange}
                                >
                                    <MenuItem value="percentage">Percentage (%)</MenuItem>
                                    <MenuItem value="fixed">Fixed Amount ($)</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label={formData.discountType === 'percentage' ? 'Discount Value (%)' : 'Discount Value ($)'}
                                name="discountValue"
                                type="number"
                                value={formData.discountValue}
                                onChange={handleInputChange}
                                required
                                fullWidth
                                inputProps={{ min: 0, max: formData.discountType === 'percentage' ? 100 : undefined }}
                            />

                            <TextField
                                label="Minimum Purchase Amount ($)"
                                name="minPurchaseAmount"
                                type="number"
                                value={formData.minPurchaseAmount}
                                onChange={handleInputChange}
                                fullWidth
                                inputProps={{ min: 0 }}
                            />

                            <TextField
                                label="Maximum Discount Amount ($)"
                                name="maxDiscountAmount"
                                type="number"
                                value={formData.maxDiscountAmount}
                                onChange={handleInputChange}
                                fullWidth
                                inputProps={{ min: 0 }}
                                helperText="Leave empty for no limit"
                            />

                            <TextField
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                fullWidth
                                multiline
                                rows={2}
                            />

                            <div className="flex gap-4">
                                <TextField
                                    label="Start Date"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />

                                <TextField
                                    label="End Date"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </div>

                            <TextField
                                label="Usage Limit"
                                name="usageLimit"
                                type="number"
                                value={formData.usageLimit}
                                onChange={handleInputChange}
                                fullWidth
                                inputProps={{ min: 0 }}
                                helperText="Leave empty for unlimited"
                            />

                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={formData.isActive}
                                    onChange={handleSwitchChange}
                                    name="isActive"
                                    color="primary"
                                />
                                <span className="font-medium">Active</span>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions className="!p-4 !gap-2">
                        <Button onClick={handleCloseDialog} variant="outlined">
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" className="btn-blue">
                            {editMode ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
};

export default DiscountCodes;