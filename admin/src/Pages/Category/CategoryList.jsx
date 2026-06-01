import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert, IconButton } from "@mui/material";
import { MyContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaTimes, FaAngleRight, FaAngleDown, 
  FaCloudUploadAlt, FaCheck, FaExclamationCircle } from "react-icons/fa";
import UploadBox from '../../Components/UploadBox';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { IoMdClose } from "react-icons/io";
import { fetchDataFromApi, postData, editData, deleteData, deleteImages } from '../../utils/api';
import { useCategories, flattenCategories, checkDuplicate } from './useCategories';
import toast from 'react-hot-toast';

const CategoryForm = ({ open, onClose, editData: editCategory, categories, onSuccess }) => {
  const context = useContext(MyContext);
  const [form, setForm] = useState({ name: '', parentId: '', description: '', metaTitle: '', 
    metaDescription: '', slug: '', images: [], imagesToDelete: [] });
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [duplicate, setDuplicate] = useState({ is: false, msg: '' });
  const [checking, setChecking] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = !!editCategory;
  const excludeId = editCategory?._id;

  useEffect(() => {
    if (open) {
      if (editCategory) {
        setForm({ name: editCategory.name || '', parentId: editCategory.parentId || '', 
          description: editCategory.description || '', metaTitle: editCategory.metaTitle || '', 
          metaDescription: editCategory.metaDescription || '', slug: editCategory.slug || '', 
          images: editCategory.images || [], imagesToDelete: [] });
        setPreviews(editCategory.images || []);
      } else {
        setForm({ name: '', parentId: '', description: '', metaTitle: '', 
          metaDescription: '', slug: '', images: [], imagesToDelete: [] });
        setPreviews([]);
      }
      setDuplicate({ is: false, msg: '' });
      setErrors({});
    }
  }, [open, editCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
    
    if (name === 'name' && value.trim().length >= 2) checkDup(value, form.parentId);
    else if (name === 'name' && !value.trim()) setDuplicate({ is: false, msg: '' });
  };

  const checkDup = async (name, parentId) => {
    const localDup = checkDuplicate(categories, name, parentId, excludeId);
    if (localDup) {
      setDuplicate({ is: true, msg: 'Category already exists with this name under the same parent!' });
      return;
    }
    setChecking(true);
    try {
      const params = new URLSearchParams({ name });
      if (parentId) params.append('parentId', parentId);
      if (excludeId) params.append('excludeId', excludeId);
      const res = await fetchDataFromApi(`/api/duplicates/category?${params}`);
      if (res?.isDuplicate) setDuplicate({ is: true, msg: res.message || 'Category already exists!' });
      else setDuplicate({ is: false, msg: '' });
    } catch {}
    setChecking(false);
  };

  const handleParentChange = (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, parentId: val }));
    if (form.name.trim() >= 2) checkDup(form.name, val);
  };

  const setPreviewsFun = (arr) => setPreviews(p => [...p, ...arr.filter(i => !p.includes(i))]);
  const removeImg = (img, idx) => {
    const arr = [...previews];
    arr.splice(idx, 1);
    setPreviews(arr);
    if (img.startsWith('http')) deleteImages(`/api/category/deteleImage?img=${img}`).catch(() => {});
  };

  const flattenForSelect = (cats, d = 0) => {
    let r = [];
    cats.forEach(c => {
      if (excludeId && c._id === excludeId) return;
      r.push({ _id: c._id, name: '— '.repeat(d) + c.name });
      if (c.children?.length) r = r.concat(flattenForSelect(c.children, d + 1));
    });
    return r;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name required';
    if (duplicate.is) errs.name = duplicate.msg;
    if (!isEdit && !previews.length) errs.images = 'Image required';
    if (Object.keys(errs).length) { setErrors(errs); toast.error(errs.name || errs.images); return; }

    setLoading(true);
    context?.setProgress(50);

    try {
      const payload = { ...form, images: previews };
      const res = isEdit 
        ? await editData(`/api/category/${excludeId}`, payload)
        : await postData('/api/category/create', payload);

      if (res?.success || res?.category) {
        toast.success(isEdit ? 'Updated!' : 'Created!');
        onSuccess();
        onClose();
      } else {
        toast.error(res?.message || 'Failed');
      }
    } catch (err) { toast.error(err.message); }

    setLoading(false);
    context?.setProgress(100);
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth PaperProps={{ className: 'rounded-xl' }}>
      <DialogTitle className="flex items-center gap-2 font-semibold text-lg">
        {isEdit ? <FaEdit /> : <FaPlus />} {isEdit ? 'Edit' : 'Add'} Category
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-4">
          <TextField fullWidth label="Category Name *" name="name" value={form.name} onChange={handleChange}
            error={!!errors.name || duplicate.is} helperText={checking ? 'Checking...' : errors.name} size="small" />
          
          {duplicate.is && <Alert severity="error" icon={<FaExclamationCircle />}>{duplicate.msg}</Alert>}

          <FormControl fullWidth size="small">
            <InputLabel>Parent Category</InputLabel>
            <Select name="parentId" value={form.parentId || ''} onChange={handleParentChange} label="Parent Category">
              <MenuItem value="">None (Top Level)</MenuItem>
              {flattenForSelect(categories).map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField fullWidth label="Description" name="description" value={form.description} 
            onChange={handleChange} multiline rows={2} size="small" />

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium mb-2 text-gray-600">SEO Settings</p>
            <TextField fullWidth label="URL Slug" name="slug" value={form.slug} onChange={handleChange} 
              size="small" placeholder="auto-generated" className="mb-2" />
            <TextField fullWidth label="Meta Title" name="metaTitle" value={form.metaTitle} 
              onChange={handleChange} size="small" className="mb-2" />
            <TextField fullWidth label="Meta Description" name="metaDescription" value={form.metaDescription} 
              onChange={handleChange} multiline rows={2} size="small" />
          </div>

          <div>
            <p className="text-sm font-medium mb-2 text-gray-700">
              Image {!isEdit && <span className="text-red-500">*</span>}
            </p>
            {errors.images && <Alert severity="error" className="mb-2">{errors.images}</Alert>}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {previews.map((img, i) => (
                <div key={i} className="relative group">
                  <IconButton size="small" className="absolute -top-1 -right-1 bg-red-500 text-white z-10"
                    onClick={() => removeImg(img, i)}><IoMdClose size={12} /></IconButton>
                  <div className="h-20 rounded-lg overflow-hidden border">
                    <LazyLoadImage src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              ))}
              <UploadBox multiple={false} setPreviewsFun={setPreviewsFun} url="/api/category/uploadImages" 
                className="!h-20 !border-2 !border-dashed !border-gray-300 !rounded-lg hover:!border-blue-400" />
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-4 pt-0 gap-2">
          <Button onClick={() => onClose()} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading || duplicate.is}
            startIcon={loading ? <CircularProgress size={16} /> : <FaCheck />}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const DeleteDialog = ({ open, onClose, category, categories, onConfirm }) => {
  const [mode, setMode] = useState('cascade');
  const [targetId, setTargetId] = useState('');
  const [loading, setLoading] = useState(false);

  const flattened = useMemo(() => flattenCategories(categories).filter(c => c._id !== category?._id), 
    [categories, category]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = mode === 'reassign' 
        ? await deleteData(`/api/category/${category._id}/delete-with-options`, 
            { mode: 'reassign', reassignToCategoryId: targetId })
        : await deleteData(`/api/category/${category._id}`, { mode: 'cascade' });
      
      if (res?.success) { toast.success('Deleted!'); onConfirm(); onClose(); }
      else toast.error(res?.message || 'Failed');
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="text-red-600 font-semibold flex items-center gap-2">
        <FaTrash /> Delete "{category?.name}"?
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" className="mb-3">This will affect all subcategories and products.</Alert>
        {category?.children?.length > 0 && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="delMode" checked={mode === 'cascade'} onChange={() => setMode('cascade')} />
              <div><strong>Delete All</strong> <p className="text-xs text-gray-500">Remove category and {category.children.length} subcategories</p></div>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="delMode" checked={mode === 'reassign'} onChange={() => setMode('reassign')} />
              <div><strong>Move to Parent</strong> <p className="text-xs text-gray-500">Move subcategories to another category</p></div>
            </label>
            {mode === 'reassign' && (
              <select className="w-full p-2 border rounded mt-2" value={targetId} onChange={e => setTargetId(e.target.value)}>
                <option value="">Select category</option>
                {flattened.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            )}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleDelete} color="error" variant="contained" disabled={loading || (mode === 'reassign' && !targetId)}
          startIcon={loading ? <CircularProgress size={16} /> : <FaTrash />}>
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TreeItem = ({ category, depth, onEdit, onDelete, onView, expanded, toggle, searchTerm, highlighted }) => {
  const hasKids = category?.children?.length > 0;
  const isExpanded = expanded.has(category._id);
  const isMatch = highlighted(category._id);

  const highlight = (txt) => {
    if (!searchTerm || !txt) return txt;
    const parts = txt.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((p, i) => regex.test(p) ? <span key={i} className="bg-yellow-200">{p}</span> : p);
  };
  const regex = new RegExp(searchTerm, 'gi');

  return (
    <div>
      <div className={`flex items-center p-3 rounded-lg mb-1 transition-all ${depth === 0 ? 'bg-gradient-to-r from-white to-gray-50 border' : 'bg-white border-l-3 border-blue-300 ml-4'}
        ${isMatch ? 'ring-2 ring-blue-400 bg-blue-50' : 'hover:bg-gray-50'}`}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}>
        {hasKids ? (
          <button onClick={() => toggle(category._id)} className="mr-2 p-1 hover:bg-blue-100 rounded text-gray-500">
            {isExpanded ? <FaAngleDown /> : <FaAngleRight />}
          </button>
        ) : <div className="w-6" />}
        
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-gray-800 block truncate">{highlight(category.name)}</span>
          <span className="text-xs text-gray-500">{category.productCount || 0} products
            {hasKids && <span className="ml-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[10px]">
              {category.children.length}
            </span>}
          </span>
        </div>

        <div className="flex items-center gap-1 ml-2">
          <Button size="small" className="!text-green-600 !min-w-auto !p-1.5" onClick={() => onView(category)} title="View Products">
            <FaEye className="text-sm" />
          </Button>
          <Button size="small" className="!text-blue-600 !min-w-auto !p-1.5" onClick={() => onEdit(category)} title="Edit">
            <FaEdit className="text-sm" />
          </Button>
          <Button size="small" className="!text-red-600 !min-w-auto !p-1.5" onClick={() => onDelete(category)} title="Delete">
            <FaTrash className="text-sm" />
          </Button>
        </div>
      </div>

      {isExpanded && hasKids && category.children.map((child, i) => (
        <TreeItem key={child._id || i} category={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} 
          onView={onView} expanded={expanded} toggle={toggle} searchTerm={searchTerm} highlighted={highlighted} />
      ))}
    </div>
  );
};

export const CategoryList = () => {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const { data: categories, isLoading, error, refetch } = useCategories();

  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [delCat, setDelCat] = useState(null);

  useEffect(() => { if (!context?.catData?.length) context?.getCat(); }, []);

  const toggle = (id) => setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const term = search.toLowerCase();
    const ids = new Set();
    const find = (cats) => { cats.forEach(c => { if (c.name.toLowerCase().includes(term)) ids.add(c._id); if (c.children) find(c.children); }); };
    find(categories);
    const getParents = (cats) => { cats.forEach(c => { if (ids.has(c._id) || c.children?.some(x => ids.has(x._id))) ids.add(c._id); if (c.children) getParents(c.children); }); };
    getParents(categories);
    return ids;
  }, [categories, search]);

  useEffect(() => { if (searchResults?.size) setExpanded(p => { const n = new Set(p); searchResults.forEach(id => n.add(id)); return n; }); }, [searchResults]);

  const handleEdit = (cat) => { setEditCat(cat); setFormOpen(true); };
  const handleDelete = (cat) => { setDelCat(cat); };
  const handleView = (cat) => navigate(`/products?${cat.parentId ? 'subCat' : 'cat'}Id=${cat._id}&${cat.parentId ? 'subCat' : 'cat'}Name=${encodeURIComponent(cat.name)}`);
  const handleSuccess = () => { context?.getCat(); refetch(); };

  if (error) return <div className="text-center py-12"><p className="text-red-500 mb-2">Failed to load</p><Button variant="contained" onClick={refetch}>Retry</Button></div>;

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-800">Categories</h2>
        <div className="flex gap-2">
          <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <FaSearch className="text-gray-400 mr-2" />, 
              endAdornment: search && <IconButton size="small" onClick={() => setSearch('')}><FaTimes /></IconButton> }}
            className="!w-64" />
          <Button variant="contained" startIcon={<FaPlus />} onClick={() => { setEditCat(null); setFormOpen(true); }}
            className="!bg-blue-600 !hover:bg-blue-700">Add Category</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        {isLoading ? (
          <div className="text-center py-12"><CircularProgress /><p className="text-gray-500 mt-2">Loading...</p></div>
        ) : !categories.length ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">No categories yet</p>
            <Button variant="contained" startIcon={<FaPlus />} onClick={() => { setEditCat(null); setFormOpen(true); }}>
              Add First Category
            </Button>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-auto p-2">
            {categories.map(cat => (
              <TreeItem key={cat._id} category={cat} depth={0} onEdit={handleEdit} onDelete={handleDelete} 
                onView={handleView} expanded={expanded} toggle={toggle} searchTerm={search} 
                highlighted={(id) => searchResults?.has(id) || false} />
            ))}
          </div>
        )}
      </div>

      <CategoryForm open={formOpen} onClose={() => { setFormOpen(false); setEditCat(null); }} 
        editData={editCat} categories={categories} onSuccess={handleSuccess} />
      
      <DeleteDialog open={!!delCat} onClose={() => setDelCat(null)} category={delCat} 
        categories={categories} onConfirm={handleSuccess} />
    </div>
  );
};

export default CategoryList;