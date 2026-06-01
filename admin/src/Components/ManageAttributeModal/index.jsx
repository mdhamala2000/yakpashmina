import React, { useState, useContext } from 'react';
import { Button } from '@mui/material';
import { AiOutlineEdit } from "react-icons/ai";
import { GoTrash } from "react-icons/go";
import CircularProgress from '@mui/material/CircularProgress';
import { fetchDataFromApi, postData, deleteData, editData } from '../../utils/api';
import { MyContext } from '../../App';
import Modal from '../ui/Modal';

const ManageAttributeModal = ({ open, onClose, title, options, onDataUpdate, baseApiPath }) => {
    const [newName, setNewName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editId, setEditId] = useState('');
    const [editName, setEditName] = useState('');
    const context = useContext(MyContext);

    const refreshData = () => {
        fetchDataFromApi(`${baseApiPath}/get`).then((res) => {
            if (res?.error === false) {
                onDataUpdate(res?.data);
            }
        });
    };

    const handleAdd = () => {
        if (!newName.trim()) return;
        setIsLoading(true);
        postData(`${baseApiPath}/create`, { name: newName.trim() }).then((res) => {
            if (res?.error === false) {
                context.alertBox("success", res?.message);
                refreshData();
                setNewName('');
            } else {
                context.alertBox("error", res?.message);
            }
            setIsLoading(false);
        });
    };

    const handleUpdate = (id) => {
        if (!editName.trim()) return;
        setIsLoading(true);
        editData(`${baseApiPath}/${id}`, { name: editName.trim() }).then((res) => {
            if (res?.data?.error === false) {
                context.alertBox("success", res?.data?.message);
                refreshData();
                setEditId('');
                setEditName('');
            } else {
                context.alertBox("error", res?.data?.message);
            }
            setIsLoading(false);
        });
    };

    const handleDelete = (id) => {
        deleteData(`${baseApiPath}/${id}`).then(() => {
            refreshData();
            context.alertBox("success", "Item deleted");
        });
    };

    const startEdit = (item) => {
        setEditId(item._id);
        setEditName(item.name);
    };

    const cancelEdit = () => {
        setEditId('');
        setEditName('');
    };

    return (
        <Modal open={open} onClose={onClose} title={title} size="sm">
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    className="flex-1 h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add new option..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                />
                <Button
                    type="button"
                    className="!h-10 !whitespace-nowrap !bg-blue-600 !text-white !px-4 !rounded-lg !text-sm hover:!bg-blue-700"
                    onClick={handleAdd}
                    disabled={isLoading || !newName.trim()}
                >
                    {isLoading ? <CircularProgress size={18} color="inherit" /> : "Add"}
                </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
                {(!options || options.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">No options yet</p>
                )}
                {options?.map((item, index) => (
                    <div key={item._id || index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        {editId === item._id ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    type="text"
                                    className="flex-1 h-8 border border-gray-300 rounded px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdate(item._id);
                                        if (e.key === 'Escape') cancelEdit();
                                    }}
                                    autoFocus
                                />
                                <Button
                                    type="button"
                                    className="!min-w-0 !w-12 !h-7 !bg-green-600 !text-white !rounded !text-xs hover:!bg-green-700"
                                    onClick={() => handleUpdate(item._id)}
                                    disabled={isLoading}
                                >
                                    Save
                                </Button>
                                <Button
                                    type="button"
                                    className="!min-w-0 !w-7 !h-7 !bg-gray-300 !text-gray-700 !rounded !text-xs hover:!bg-gray-400"
                                    onClick={cancelEdit}
                                >
                                    <span className="text-xs font-bold">X</span>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <span className="text-sm text-gray-800 font-medium">{item.name}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(item)}
                                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500 hover:text-blue-600 transition-colors"
                                        title="Edit"
                                    >
                                        <AiOutlineEdit size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item._id)}
                                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <GoTrash size={15} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default ManageAttributeModal;
