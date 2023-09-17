import { useRouter } from 'next/router';
import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import Search from '@/components/common/search';
import ProductList from '@/components/product/product-list';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { SortOrder } from '@/types';
import { useState } from 'react';
import { syncProductQuery, useProductsQuery } from '@/data/product';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { productClient } from '@/data/client/product';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import CategoryTypeFilter from '@/components/product/category-type-filter';
import cn from 'classnames';
import { ArrowDown } from '@/components/icons/arrow-down';
import { ArrowUp } from '@/components/icons/arrow-up';
import { adminOnly } from '@/utils/auth-utils';
import LinkButton from '@/components/ui/link-button';
import { Config } from '@/config';
import { useShopQuery } from '@/data/shop';
import { useQuery } from 'react-query';
import { HttpClient } from '@/data/client/http-client';
import { toast } from 'react-toastify';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);
  const [visible, setVisible] = useState(false);

  const [syncProductsLoading,setSyncProductsLoading] = useState(false)

  const toggleVisible = () => {
    setVisible((v) => !v);
  };

  const router = useRouter();
  const { locale } = useRouter();


  const { products, loading, paginatorInfo, error } = useProductsQuery({
    language: locale,
    limit: 20,
    page,
    type,
    categories: category,
    name: searchTerm,
    orderBy,
    sortedBy,
  });


  const handleSyncProducts = async() => {
    setSyncProductsLoading(true)
    const response = await HttpClient.get(`${API_ENDPOINTS.SYNC_PRODUCTS}`)
    console.log(response)
    setSyncProductsLoading(false)
    if(response){
      toast.success('Syncing Products Successfull.');
    }
  }


  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col">
        <div className="flex w-full flex-col items-center md:flex-row">
          <div className="mb-4 md:mb-0 md:w-1/4">
            <h1 className="text-lg font-semibold text-heading">
              {t('form:input-label-products')}
            </h1>
          </div>

          <div className="flex w-full flex-col items-center ms-auto md:w-3/4">
            <Search onSearch={handleSearch} />
          </div>

          {locale === Config.defaultLanguage && (
                <LinkButton
                  href={`/products/create`}
                  className="h-12 ms-4 md:ms-6"
                >
                  <span className="hidden md:block">
                    + {t('form:button-label-add-product')}
                  </span>
                  <span className="md:hidden">
                    + {t('form:button-label-add')}
                  </span>
                </LinkButton>
          )}

        <LinkButton
          href={`/products/product-import`}
          className="h-12 ms-4 md:ms-6"
        >
          <span className="hidden md:block">
            + Bulk Import Products
          </span>
          <span className="md:hidden">
            + Bulk Import Products
          </span>
        </LinkButton>
        <LinkButton
          href="javascript:void(0)"
          className="h-12 ms-4 md:ms-6"
          onClick={handleSyncProducts}
        >

        {syncProductsLoading && (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        Sync With ERP
        </LinkButton>

        </div>

        <div
          className={cn('flex w-full transition', {
            'visible h-auto': visible,
            'invisible h-0': !visible,
          })}
        >
          <div className="mt-5 flex w-full flex-col border-t border-gray-200 pt-5 md:mt-8 md:flex-row md:items-center md:pt-8">
            <CategoryTypeFilter
              className="w-full"
              onCategoryFilter={({ slug }: { slug: string }) => {
                setPage(1);
                setCategory(slug);
              }}
              onTypeFilter={({ slug }: { slug: string }) => {
                setType(slug);
                setPage(1);
              }}
            />
          </div>
        </div>
      </Card>
      
      <ProductList
        products={products}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        onOrder={setOrder}
        onSort={setColumn}
      />
    </>
  );
}
ProductsPage.authenticate = {
  permissions: adminOnly,
};
ProductsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
