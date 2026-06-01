import { useState, useEffect, useCallback } from 'react';
import { fetchDataFromApi, postData, editData, deleteData } from '../../utils/api';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchDataFromApi('/api/category');
      setCategories(res?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { data: categories, isLoading, error, refetch };
};

export const flattenCategories = (cats, prefix = '') => {
  let result = [];
  cats.forEach(cat => {
    result.push({ _id: cat._id, name: prefix + cat.name, parentId: cat.parentId });
    if (cat.children?.length) result = result.concat(flattenCategories(cat.children, prefix + '— '));
  });
  return result;
};

export const checkDuplicate = (categories, name, parentId, excludeId = null) => {
  const normalized = name.trim().toLowerCase();
  const search = (items, targetParent) => {
    for (const item of items) {
      if (excludeId && item._id === excludeId) continue;
      if (item.name?.toLowerCase().trim() === normalized && 
          (targetParent === null || targetParent === '' ? !item.parentId : item.parentId === targetParent)) {
        return true;
      }
      if (item.children?.length && search(item.children, targetParent)) return true;
    }
    return false;
  };
  return search(categories, parentId || null);
};