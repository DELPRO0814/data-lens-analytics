/**
 * ProductsPage 컴포넌트
 * -----------------------------------------------------
 * 주요 동작 요약:
 * - 제품 정보를 관리하는 페이지로, 제품 목록을 테이블 형태로 표시합니다.
 * - Supabase products 테이블에서 제품 데이터를 조회하며 모델명 기준 정렬합니다.
 * - 검색, 필터링(카테고리/크기/가격 범위), CSV/JSON 내보내기 기능을 제공합니다.
 * - 원가/판매가 통화 포맷팅, 인치 단위 표시 등 데이터 가독성을 높였습니다.
 *
 * 상세 설명:
 * - 페이지 진입 시 제품 데이터 자동 조회 및 로딩 상태 관리
 * - 필터 유형: 
 *   - 카테고리 다중 선택(모니터/TV/노트북 등)
 *   - 인치 크기 슬라이더(10~85인치)
 *   - 원가/판매가 숫자 범위 검색
 * - 컬럼별 커스텀 렌더링으로 가격(원화 표기), 크기(인치) 포맷팅
 * - 에러 발생 시 사용자 친화적 토스트 알림 제공
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Copy, 
  Package, 
  Car, 
  Truck, 
  Zap, 
  Rocket, 
  Tv, 
  Laptop, 
  Ruler, 
  Banknote 
} from 'lucide-react';

const ProductsPage = () => {
  // 상태 관리
  const [products, setProducts] = useState([]);  // 제품 데이터 목록
  const [loading, setLoading] = useState(true);  // 데이터 로딩 상태
  const { toast } = useToast();                  // 토스트 알림 훅

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * 제품 데이터 조회 함수
   */
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

  /**
   * 클립보드 복사 핸들러
   * @param text 복사할 텍스트
   */
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "복사 완료",
      description: `${text}가 클립보드에 복사되었습니다.`,
    });
  };

  // --- ✨ 테이블 컬럼 정의 (UI 개선) ---
  const columns = [
  { 
    key: 'product_id', 
    label: '제품 ID',
    render: (value: string) => (
      <div className="flex items-center gap-2 font-mono text-sm">
        <span>{value}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(value)}>
              <Copy className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>ID 복사하기</p>
          </TooltipContent>
        </Tooltip>
      </div>
    )
  },
  { 
    key: 'model', 
    label: '모델명',
    render: (value, row) => (
      <div className="flex items-start gap-3">
        <Package className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
        <div>
          <p className="font-medium text-foreground">{value}</p>
          {row.notes && (
            <p className="text-sm text-muted-foreground">{row.notes}</p>
          )}
        </div>
      </div>
    )
  },
  { 
    key: 'category', 
    label: '카테고리',
    render: (value: string) => {
      const categoryMap = {
        '스포츠': { icon: <Rocket className="h-3 w-3" />, variant: 'default' },
        'SUV': { icon: <Car className="h-3 w-3" />, variant: 'secondary' },
        '전기차': { icon: <Zap className="h-3 w-3" />, variant: 'outline' },
        '승용차': { icon: <Laptop className="h-3 w-3" />, variant: 'secondary' },
        '레이싱': { icon: <Rocket className="h-3 w-3" />, variant: 'destructive' },
        '트럭': { icon: <Truck className="h-3 w-3" />, variant: 'outline' },
        'default': { icon: <Package className="h-3 w-3" />, variant: 'outline' }
      };
      const style = categoryMap[value] || categoryMap['default'];
      
      return (
        <Badge variant={style.variant} className="gap-1.5 whitespace-nowrap">
          {style.icon}
          {value || '-'}
        </Badge>
      );
    }
  },
  { 
    key: 'originalprice', 
    label: '원가',
    // [수정] align: 'right' 제거 및 flex 정렬 변경
    render: (value) => (
      <div className="flex items-center justify-start gap-2">
        <Banknote className="h-4 w-4 text-slate-400" />
        <span>{`₩${(value || 0).toLocaleString()}`}</span>
      </div>
    )
  },
  { 
    key: 'sellingprice', 
    label: '판매가',
    fontWeight: '500', 
    // [수정] align: 'right' 제거 및 flex 정렬 변경
    render: (value) => (
      <div className="flex items-center justify-start gap-2 font-semibold">
         <Banknote className="h-4 w-4 text-sky-500" />
         <span className="text-sky-600">{`₩${(value || 0).toLocaleString()}`}</span>
      </div>
    )
  },
  { 
    key: 'margin',
    label: '마진율',
    // [수정] align: 'center' 제거 및 flex 정렬 변경
    render: (_, row) => {
      const { originalprice, sellingprice } = row;
      if (!originalprice || !sellingprice) {
        return (
          <div className="flex items-center justify-start">
            <Badge variant="secondary">N/A</Badge>
          </div>
        );
      }
      
      const marginRate = ((sellingprice - originalprice) / sellingprice) * 100;
      
      let badgeClassName: string;
    let tooltipText: string;
    
    if (marginRate > 30) {
      // 파란색 (수익성 최상)
      badgeClassName = "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900 dark:text-blue-200";
      tooltipText = "수익성 최상 (30% 초과)";
    } else if (marginRate > 20) {
      // 녹색 (수익성 양호)
      badgeClassName = "border-transparent bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-200";
      tooltipText = "수익성 양호 (20% 초과 ~ 30% 이하)";
    } else {
      // 노란색 (수익성 확인 필요)
      badgeClassName = "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900 dark:text-yellow-200";
      tooltipText = "수익성 확인 필요 (20% 이하)";
    }

    return (
      <div className="flex items-center justify-start">
        <Tooltip>
          <TooltipTrigger>
            {/* variant 대신 className을 사용하여 직접 색상을 지정합니다 */}
            <Badge className={badgeClassName}>{marginRate.toFixed(1)}%</Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }
},
    { 
    key: 'inch', 
    label: '사이즈',
    // [수정] align: 'center' 제거 및 flex 정렬 변경
    render: (value) => value ? (
      <div className="flex items-center justify-start gap-2">
        <Ruler className="h-4 w-4 text-muted-foreground" />
        <span>{`${value}"`}</span>
      </div>
    ) : '-'
  },
];
  // 필터 설정
  const filterFields = [
    {
      key: 'model',
      label: '모델명',
      type: 'multiSelect' as const,  // 다중 선택 필터
      options: [
        { value: 'Dynapro HPX / Dynapro HT', label: 'Dynapro HPX / Dynapro HT' },
        { value: 'Enfren', label: 'Enfren' },
        { value: 'iON', label: 'iON' },
        { value: 'Kinergy ST / Kinergy AS EV', label: 'Kinergy ST / Kinergy AS EV' },
        { value: 'Smart Control / Smart Work', label: 'Smart Control / Smart Work' },
        { value: 'Smart Flex', label: 'Smart Flex' },
        { value: 'Ventus RS4', label: 'Ventus RS4' },
        { value: 'Ventus S1 evo3', label: 'Ventus S1 evo3' },
        { value: 'Ventus S2 AS', label: 'Ventus S2 AS' },
        { value: 'Ventus V12 evo2', label: 'Ventus V12 evo2' },
      ]
    },
    {
      key: 'category',
      label: '카테고리',
      type: 'multiSelect' as const,  // 다중 선택 필터
      options: [
        { value: 'Sports', label: '스포츠' },
        { value: 'SUV', label: 'SUV' },
        { value: '전기차', label: '전기차' },
        { value: '승용차', label: '승용차' },
        { value: '레이싱', label: '레이싱' },
        { value: '트럭', label: '트럭' }
      ]
    },
    {
      key: 'inch',
      label: '크기 (인치)',
      type: 'multiSelect' as const,  // 슬라이더 필터
      options: [
        { value: '15', label: "15" },
        { value: '16', label: "16" },
        { value: '17', label: "17" },
        { value: '18', label: "18" },
        { value: '19', label: "19" },
        { value: '20', label: "20" },
        { value: '21', label: "21" },
      ]
    },
    {
      key: 'originalprice',
      label: '원가',
      type: 'numberRange' as const  // 숫자 범위 필터
    },
    {
      key: 'sellingprice',
      label: '판매가',
      type: 'numberRange' as const
    }
  ];

  // 로딩 상태 표시
  if (loading) {
    return <div className="text-center py-8">제품 데이터를 불러오는 중...</div>;
  }

  return (
    // TooltipProvider로 전체를 감싸야 툴팁이 정상 동작합니다.
    <TooltipProvider>
      <div>
        <PageHeader 
          title="제품 관리" 
          description="판매 제품 정보를 관리합니다. 카테고리, 크기, 가격별로 필터링할 수 있습니다."
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
    </TooltipProvider>
  );
};

export default ProductsPage;