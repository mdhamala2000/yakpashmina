import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { MdOutlineModeEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { Button } from "@mui/material";
import { MyContext } from "../../App";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import { deleteData, editData, fetchDataFromApi } from "../../utils/api";
import { updateCategory, fetchCategories } from '../../store/slices/categorySlice';
import toast from 'react-hot-toast';

export const EditSubCatBox = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectVal, setSelectVal] = useState('');
  const [formFields, setFormFields] = useState({
    name: "",
    parentCatName: null,
    parentId: null
  })

  const context = useContext(MyContext);
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.category);

  useEffect(() => {
    setFormFields(prev => ({
      ...prev,
      name: props?.name || "",
      parentCatName: props?.selectedCatName || null,
      parentId: props?.selectedCat || null
    }));
    setSelectVal(props?.selectedCat || '');
  }, [props?.name, props?.selectedCatName, props?.selectedCat]);

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectVal(value);
    const selectedCategory = categories.find(cat => cat._id === value);
    setFormFields(prev => ({
      ...prev,
      parentId: value,
      parentCatName: selectedCategory?.name || null
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (formFields.name === "") {
      toast.error("Please enter category name");
      setIsLoading(false);
      return false;
    }

    dispatch(updateCategory({ id: props?.id, data: formFields })).then((result) => {
      setIsLoading(false);
      if (updateCategory.fulfilled.match(result)) {
        toast.success("Category updated successfully!");
        setEditMode(false);
        dispatch(fetchCategories());
      } else {
        toast.error(result.payload || "Failed to update category");
      }
    });
  };

  const deleteCat = (id) => {
    if (context?.userData?.role === "ADMIN") {
      if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
        deleteData(`/api/category/${id}`).then((res) => {
          if (res?.success === false) {
            toast.error(res?.message || "Cannot delete this category. It may contain products.");
          } else {
            toast.success("Category deleted successfully!");
            context?.getCat();
          }
        }).catch((err) => {
          toast.error("Failed to delete category. Please try again.");
        });
      }
    } else {
      toast.error("Only admin can delete data");
    }
  };

  return (
    <form className="w-100 flex items-center gap-3 p-0 px-4" onSubmit={handleSubmit}>
      {editMode && (
        <div className="flex items-center justify-between py-2 gap-4 whitespace-nowrap overflow-x-scroll">
          <div className="w-[180px] md:w-[150px]">
            <Select
              style={{ zoom: '75%' }}
              className="w-full"
              size="small"
              value={selectVal}
              onChange={handleChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
            >
              {categories?.length !== 0 && categories?.map((item, index) => (
                <MenuItem value={item?._id} key={index}>{item?.name}</MenuItem>
              ))}
            </Select>
          </div>

          <input 
            type="text" 
            className='w-[150px] md:w-full h-[30px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm' 
            name="name" 
            value={formFields?.name} 
            onChange={onChangeInput} 
          />

          <div className="flex items-center gap-2">
            <Button size="small" className="btn-sml" type="submit" variant="contained">
              {isLoading ? <CircularProgress color="inherit" size={20} /> : "Edit"}
            </Button>
            <Button size="small" variant="outlined" onClick={() => setEditMode(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {!editMode && (
        <>
          <span className="font-[500] text-[14px]">{props?.name}</span>
          <div className="flex items-center ml-auto gap-2">
            <Button 
              className="!min-w-[35px] !w-[35px] !h-[35px] !rounded-full !text-blue-600 hover:!bg-blue-50"
              onClick={() => setEditMode(true)}
            >
              <MdOutlineModeEdit />
            </Button>
            <Button 
              className="!min-w-[35px] !w-[35px] !h-[35px] !rounded-full !text-red-600 hover:!bg-red-50"
              onClick={() => deleteCat(props?.id)}
            >
              <FaRegTrashAlt />
            </Button>
          </div>
        </>
      )}
    </form>
  )
}

export default EditSubCatBox;