import React, { useContext, useState, useEffect } from 'react';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress } from "@mui/material";
import UploadBox from '../../Components/UploadBox';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { IoMdClose } from "react-icons/io";
import { FaCloudUploadAlt } from "react-icons/fa";
import { fetchDataFromApi, postData, deleteImages } from '../../utils/api';
import { MyContext } from '../../App';
import { flattenCategories, checkDuplicate } from './useCategories';
import toast from 'react-hot-toast';

const AddSubCategory = () => {
  const context = useContext(MyContext);
  const [form, setForm] = useState({ name: '', parentId: '', description: '', metaTitle: '', metaDescription: '', slug: '', images: [] });
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [duplicate, setDuplicate] = useState({ is: false, msg: '' });
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchDataFromApi('/api/category').then(res => {
      const cats = res?.data || [];
      setCategories(cats);
      // Auto-select first category as parent
      if (cats.length > 0) setForm(p => ({ ...p, parentId: cats[0]._id }));
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (name === 'name' && value.trim().length >= 2) checkDup(value, form.parentId);
    else if (name === 'name' && !value.trim()) setDuplicate({ is: false, msg: '' });
  };

  const checkDup = async (name, parentId) => {
    if (checkDuplicate(categories, name, parentId)) { setDuplicate({ is: true, msg: 'Category already exists!' }); return; }
    setChecking(true);
    try {
      const params = new URLSearchParams({ name });
      if (parentId) params.append('parentId', parentId);
      const res = await fetchDataFromApi(`/api/duplicates/category?${params}`);
      if (res?.isDuplicate) setDuplicate({ is: true, msg: res.message || 'Already exists!' });
      else setDuplicate({ is: false, msg: '' });
    } catch {}
    setChecking(false);
  };

  const setPreviewsFun = (arr) => setPreviews(p => [...p, ...arr.filter(i => !p.includes(i))]);
  const removeImg = (img, i) => { const a = [...previews]; a.splice(i, 1); setPreviews(a); if (img.startsWith('http')) deleteImages(`/api/category/deteleImage?img=${img}`).catch(() => {}); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name required'); return; }
    if (duplicate.is) { toast.error(duplicate.msg); return; }
    if (!previews.length) { toast.error('Image required'); return; }

    setLoading(true);
    postData('/api/category/create', { ...form, images: previews }).then(res => {
      setLoading(false);
      if (res?.success || res?.category) {
        toast.success('Created!');
        context.setIsOpenFullScreenPanel({ open: false });
        context.getCat();
      } else toast.error(res?.message || 'Failed');
    });
  };

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Add Sub Category</h2>
          
          <TextField fullWidth size="small" label="Category Name *" name="name" value={form.name} onChange={handleChange}
            error={duplicate.is} helperText={checking ? 'Checking...' : ''} />
          {duplicate.is && <Alert severity="error">{duplicate.msg}</Alert>}

          <FormControl fullWidth size="small" required>
            <InputLabel>Parent Category</InputLabel>
            <Select value={form.parentId || ''} onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))} label="Parent Category">
              {flattenCategories(categories).map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField fullWidth size="small" label="Description" name="description" value={form.description} onChange={handleChange} multiline rows={2} />

          <div>
            <p className="font-medium text-gray-700 text-sm mb-2">Category Image *</p>
            <div className="grid grid-cols-4 gap-2">
              {previews.map((img, i) => (
                <div key={i} className="relative">
                  <button type="button" onClick={() => removeImg(img, i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs z-10">
                    <IoMdClose />
                  </button>
                  <div className="h-20 rounded-lg overflow-hidden border"><LazyLoadImage src={img} className="w-full h-full object-cover" /></div>
                </div>
              ))}
              <UploadBox multiple={false} setPreviewsFun={setPreviewsFun} url="/api/category/uploadImages" className="!h-20 !border-2 !border-dashed !border-gray-300 !rounded-lg" />
            </div>
          </div>

          <Button type="submit" variant="contained" fullWidth disabled={loading || duplicate.is}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <FaCloudUploadAlt />}
            className="!bg-green-600 !py-2">
            {loading ? 'Creating...' : 'Create Sub Category'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddSubCategory;