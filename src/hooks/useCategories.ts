import {useState, useEffect} from "react";
import categoryService, {Category} from "@/services/category.service";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAll({limit: 100});
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {categories, loading, refreshCategories: fetchCategories};
};
