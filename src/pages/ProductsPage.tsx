
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('model');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('제품 데이터 로딩 오류:', error);
      toast({
        title: "오류",
        description: "제품 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'product_id', label: '제품 ID' },
    { key: 'model', label: '모델명' },
    { key: 'category', label: '카테고리' },
    { 
      key: 'inch', 
      label: '크기(인치)',
      render: (value: number) => value ? `${value}"` : '-'
    },
    { 
      key: 'originalprice', 
      label: '원가',
      render: (value: number) => value ? `${value.toLocaleString()}원` : '-'
    },
    { 
      key: 'sellingprice', 
      label: '판매가',
      render: (value: number) => value ? `${value.toLocaleString()}원` : '-'
    },
    { key: 'notes', label: '비고' }
  ];

  const filterFields = [
    {
      key: 'category',
      label: '카테고리',
      type: 'multiSelect' as const,
      options: [
        { value: 'Monitor', label: '모니터' },
        { value: 'TV', label: 'TV' },
        { value: 'Laptop', label: '노트북' },
        { value: 'Desktop', label: '데스크톱' },
        { value: 'Tablet', label: '태블릿' }
      ]
    },
    {
      key: 'inch',
      label: '크기 (인치)',
      type: 'slider' as const,
      min: 10,
      max: 85,
      step: 1
    },
    {
      key: 'originalprice',
      label: '원가',
      type: 'numberRange' as const
    },
    {
      key: 'sellingprice',
      label: '판매가',
      type: 'numberRange' as const
    }
  ];

  if (loading) {
    return <div className="text-center py-8">로딩중...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="제품 관리" 
        description="판매 제품 정보를 관리합니다."
      />
      <DataTable 
        data={products}
        columns={columns}
        searchPlaceholder="제품명, 모델명으로 검색..."
        filterFields={filterFields}
        exportable={true}
        tableName="products"
      />
    </div>
  );
};

export default ProductsPage;
