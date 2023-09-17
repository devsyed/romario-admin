import { adminOnly } from '@/utils/auth-utils';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/layouts/admin';
import Card from '@/components/common/card';
import React, { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image'

export default function Images() {
  const [files, setFiles] = useState([]);
  const [images,setImages] = useState([]);
  const [refetch,setRefetch] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for(let i=0; i < files.length; i++){
      formData.append(`file_${i}`,files[i]);
    }

    const response = await fetch('https://romario.test/api/bulk_images', {
      method: 'POST',
      body: formData, // Send the FormData object directly
    })
    if(response.status == 200){
      const data = await response.json();
      setRefetch(data)
      toast('All Images have been uploaded to the respective Products.')
    }else{
      toast('Error has occured, try uploading again.')
    }
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    console.log(files)
    setFiles(files);
  };

  const getImages = async() => {
    const response = await fetch('https://romario.test/api/bulk_images')
    if(response.status == 200){
      const data = await response.json();
      setImages(data)
    }
  }

  useEffect(() => {
    getImages()
  },[refetch])

  return (
    <>
      <form className='mb-8' onSubmit={handleSubmit} encType="multipart/form-data">
        <Card className="mb-8 flex flex-col">
          <div className="flex w-full flex-col items-center md:flex-row">
            <div className="mb-4 md:mb-0 md:w-1/4">
              <h1 className="text-lg font-semibold text-heading">Bulk Add Images</h1>
            </div>
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Upload file</label>
<input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" multiple={true} onChange={handleFileChange} type="file"/>
            </Card>
          </div>
        </Card>
        <button style={{ background: '#1e3bd9', color: '#fff', padding: '10px 30px' }} type="submit">
          Save Images
        </button>
      </form>

      <hr />
      <Card className="mb-8 flex flex-col">
        <h1 className="text-lg font-semibold text-heading mb-5">Uploaded Images</h1>
        <div className="flex flex-wrap gap-10">
        {images?.map(image => (
          <div>
            <img className='border w-[250px]' src={image?.image_path}/>
          <small>{image?.image_name}</small>
          <a href={`/products/${image?.product_slug}/edit`}> <h3 className='font-semibold'>{image?.product_name}</h3></a>
          </div>
        ))}
        </div>
      </Card>
    </>
  );
}

Images.authenticate = {
  permissions: adminOnly,
};

Images.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['form', 'common', 'table'])),
  },
});
